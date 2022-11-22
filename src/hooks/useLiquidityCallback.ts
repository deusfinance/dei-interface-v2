import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useStablePoolContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { DefaultHandlerError } from 'utils/parseError'
import { BN_TEN, toBN } from 'utils/numbers'
import { StablePoolType } from 'constants/sPools'

export enum LiquidityCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useManageLiquidity(
  amounts: string[],
  minAmountOut: string,
  pool: StablePoolType,
  slippage: number,
  deadline: number,
  isRemove: boolean
): {
  state: LiquidityCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const swapContract = useStablePoolContract(pool)

  const deadlineValue = Math.round(new Date().getTime() / 1000 + 60 * deadline)
  const minAmountOutBN = toBN(minAmountOut).times(1e18).toFixed(0, 1)
  const amountsInBN = amounts.map((amount, index) => {
    if (amount == '') return '0'
    return toBN(amount).times(BN_TEN.pow(pool.liquidityTokens[index].decimals)).toFixed(0, 1)
  })

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !swapContract || !amounts || !amounts.length) {
        throw new Error('Missing dependencies.')
      }
      let args = []
      const methodName = isRemove ? 'removeLiquidity' : 'addLiquidity'

      if (isRemove) {
        const minAmountsBN = amountsInBN.map((amount) => {
          return toBN(amount)
            .multipliedBy((100 - Number(slippage)) / 100)
            .toFixed(0, 1)
        })
        args = [minAmountOutBN, minAmountsBN, deadlineValue]
      } else {
        const minToMint = toBN(minAmountOutBN)
          .multipliedBy((100 - Number(slippage)) / 100)
          .toFixed(0, 1)
        args = [amountsInBN, minToMint, deadlineValue]
      }
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
  }, [account, library, swapContract, amounts, slippage, isRemove, minAmountOutBN, amountsInBN, deadlineValue])

  return useMemo(() => {
    if (!account || !chainId || !library || !swapContract || !pool || !slippage || !deadline) {
      return {
        state: LiquidityCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!amounts || !amounts.length || !minAmountOut) {
      return {
        state: LiquidityCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: LiquidityCallbackState.VALID,
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
            const lpSymbol = pool.lpToken.symbol
            const summary = isRemove
              ? `Remove ${minAmountOut} ${lpSymbol} from pool`
              : `Deposit into pool for ${minAmountOut} ${lpSymbol}`
            // TODO: add different summary
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
    amounts,
    deadline,
    minAmountOut,
    pool,
    slippage,
    addTransaction,
    constructCall,
    swapContract,
    isRemove,
  ])
}
