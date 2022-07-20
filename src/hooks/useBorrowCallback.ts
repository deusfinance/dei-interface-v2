import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token, ZERO } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import { BorrowAction, BorrowPool, LenderVersion, TypedField } from 'state/borrow/reducer'
import { useUserPoolData } from 'hooks/usePoolData'
import { BorrowClient } from 'lib/muon'

import useWeb3React from './useWeb3'
import { useGeneralLenderContract } from './useContract'
import { calculateGasMargin } from 'utils/web3'
import { toHex } from 'utils/hex'
import { DefaultHandlerError } from 'utils/parseError'

export enum BorrowCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useBorrowCallback(
  collateralCurrency: Currency | undefined,
  borrowCurrency: Currency | undefined,
  collateralAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  borrowAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  pool: BorrowPool,
  action: BorrowAction,
  typedField: TypedField,
  payOff: boolean | null
): {
  state: BorrowCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { chainId, account, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const GeneralLender = useGeneralLenderContract(pool)
  const { userBorrow } = useUserPoolData(pool)

  const getOracleData = useCallback(async () => {
    const result = await BorrowClient.getCollateralPrice(pool)
    if (result.success === false) {
      throw new Error(`Unable to fetch Muon collateral price: ${result.error}`)
    }
    return result.data.calldata
  }, [pool])

  const constructCall = useCallback(async () => {
    try {
      if (!account || !chainId || !library || !GeneralLender || !collateralCurrency || !borrowCurrency) {
        throw new Error('Missing dependencies.')
      }

      let args = []
      let methodName

      if (action === BorrowAction.BORROW && typedField === TypedField.COLLATERAL) {
        if (!collateralAmount) throw new Error('Missing collateralAmount.')
        args = [account, toHex(collateralAmount.quotient)]
        methodName = 'addCollateral'
      } else if (action === BorrowAction.REPAY && typedField === TypedField.COLLATERAL) {
        if (!collateralAmount) throw new Error('Missing collateralAmount.')
        args = [account, toHex(collateralAmount.quotient)]

        if (pool.version == LenderVersion.V2) {
          const { price, reqId, sigs, timestamp } = await getOracleData()
          if (!price || !reqId || !sigs || !timestamp) throw new Error('Missing dependencies from muon oracles.')
          args = [...args, price, timestamp, reqId, sigs]
        }
        methodName = 'removeCollateral'
      } else if (action === BorrowAction.BORROW && typedField === TypedField.BORROW) {
        if (!borrowAmount) throw new Error('Missing borrowAmount.')
        args = [account, toHex(borrowAmount.quotient)]

        if (pool.version == LenderVersion.V2) {
          const { price, reqId, sigs, timestamp } = await getOracleData()
          if (!price || !reqId || !sigs || !timestamp) throw new Error('Missing dependencies from muon oracles.')
          args = [...args, price, timestamp, reqId, sigs]
        }
        methodName = 'borrow'
      } else if (action === BorrowAction.REPAY && typedField === TypedField.BORROW && payOff) {
        if (!userBorrow) throw new Error('Missing userBorrow.')
        args = [account, new BigNumber(userBorrow).times(1e18).toFixed(0)]
        methodName = 'repayBase'
      } else {
        if (!borrowAmount) throw new Error('Missing borrowAmount.')
        args = [account, toHex(borrowAmount.quotient)]
        methodName = 'repayElastic'
      }

      return {
        address: GeneralLender.address,
        calldata: GeneralLender.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [
    pool,
    chainId,
    account,
    library,
    GeneralLender,
    collateralCurrency,
    borrowCurrency,
    action,
    typedField,
    collateralAmount,
    borrowAmount,
    payOff,
    userBorrow,
    getOracleData,
  ])

  return useMemo(() => {
    if (!account || !chainId || !library || !GeneralLender || !collateralCurrency || !borrowCurrency) {
      return {
        state: BorrowCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if ((!collateralAmount || collateralAmount.equalTo(ZERO)) && (!borrowAmount || borrowAmount.equalTo(ZERO))) {
      return {
        state: BorrowCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: BorrowCallbackState.VALID,
      error: null,
      callback: async function onTrade(): Promise<string> {
        console.log('onBorrow callback')
        const call = await constructCall()
        const { address, calldata, value } = call

        if ('error' in call) {
          console.error(call.error)
          if (call.error.message) {
            throw new Error(call.error.message)
          } else {
            throw new Error('Unexpected error. Could not construct calldata.')
          }
        }

        const tx = !value
          ? { from: account, to: address, data: calldata }
          : { from: account, to: address, data: calldata, value }

        console.log('BORROW TRANSACTION', { tx, value })

        const estimatedGas = await library.estimateGas(tx).catch((gasError) => {
          console.debug('Gas estimate failed, trying eth_call to extract error', call)

          return library
            .call(tx)
            .then((result) => {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
              return {
                error: new Error('Unexpected issue with estimating the gas. Please try again.'),
              }
            })
            .catch((callError) => {
              console.debug('Call threw an error', call, callError)
              toast.error(DefaultHandlerError(callError))

              return {
                error: new Error(callError.message), // TODO make this human readable
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for this transaction.')
        }

        return library
          .getSigner()
          .sendTransaction({
            ...tx,
            ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
            // gasPrice /// TODO add gasPrice based on EIP 1559
          })
          .then((response: TransactionResponse) => {
            console.log(response)

            const summary =
              action === BorrowAction.BORROW
                ? typedField === TypedField.COLLATERAL
                  ? `Deposit ${collateralAmount?.toSignificant()} ${collateralCurrency.symbol}`
                  : `Borrow ${borrowAmount?.toSignificant()} ${borrowCurrency.symbol}`
                : typedField === TypedField.COLLATERAL
                ? `Withdraw ${collateralAmount?.toSignificant()} ${collateralCurrency.symbol}`
                : `Repay ${borrowAmount?.toSignificant()} ${borrowCurrency.symbol}`

            addTransaction(response, { summary })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Transaction failed`, error, address, calldata, value)
              throw new Error(`Transaction failed: ${error.message}`)
            }
          })
      },
    }
  }, [
    account,
    chainId,
    library,
    addTransaction,
    constructCall,
    action,
    typedField,
    GeneralLender,
    collateralCurrency,
    borrowCurrency,
    collateralAmount,
    borrowAmount,
  ])
}
