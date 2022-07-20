import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useDeiSwapContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { toHex } from 'utils/hex'
import { DefaultHandlerError } from 'utils/parseError'
import { toBN } from 'utils/numbers'

export enum RedeemCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useSwapCallback(
  bdeiCurrency: Currency,
  deiCurrency: Currency,
  bdeiAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  deiAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  slippage: number,
  deadline: number
): {
  state: RedeemCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const swapContract = useDeiSwapContract()
  const deadlineValue = Math.round(new Date().getTime() / 1000 + 60 * deadline)

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !swapContract || !deiAmount || !bdeiAmount) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'swap'

      const subtractSlippage = toBN(toHex(deiAmount.quotient))
        .multipliedBy((100 - Number(slippage)) / 100)
        .toFixed(0, 1)

      const args = [1, 0, toHex(bdeiAmount.quotient), subtractSlippage, deadlineValue]
      console.log({ args })

      return {
        address: swapContract.address,
        calldata: swapContract.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, swapContract, deiAmount, bdeiAmount, slippage, deadlineValue])

  return useMemo(() => {
    if (!account || !chainId || !library || !swapContract || !bdeiCurrency || !deiCurrency || !deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!bdeiAmount || !deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: RedeemCallbackState.VALID,
      error: null,
      callback: async function onSwap(): Promise<string> {
        console.log('onSwap callback')
        const call = constructCall()
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

        console.log('SWAP TRANSACTION', { tx, value })

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
            const summary = `Swap ${bdeiAmount?.toSignificant()} bDEI for ${deiAmount?.toSignificant()} DEI`
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
    swapContract,
    bdeiCurrency,
    deiCurrency,
    bdeiAmount,
    deiAmount,
  ])
}
