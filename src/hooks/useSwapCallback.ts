import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useStablePoolContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { toHex } from 'utils/hex'
import { DefaultHandlerError } from 'utils/parseError'
import { toBN } from 'utils/numbers'
import { getTokenIndex, StablePoolType } from 'constants/sPools'
import { LiquidityPool } from 'constants/stakingPools'

export enum TransactionCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useSwapCallback(
  inputCurrency: Currency,
  outputCurrency: Currency,
  inputAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  outputAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  pool: StablePoolType,
  slippage: number,
  deadline: number
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const liquidityPool = LiquidityPool.find((liqPool) => liqPool.id === pool.id) || LiquidityPool[0]
  const swapContract = useStablePoolContract(liquidityPool)
  const deadlineValue = Math.round(new Date().getTime() / 1000 + 60 * deadline)

  const [inputIndex, outputIndex] = useMemo(() => {
    return [getTokenIndex(inputCurrency.wrapped.address, pool), getTokenIndex(outputCurrency.wrapped.address, pool)]
  }, [inputCurrency, outputCurrency, pool])

  const positions = useMemo(() => {
    if (inputIndex !== null && outputIndex !== null) return [inputIndex, outputIndex]
    return null
  }, [inputIndex, outputIndex])

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !swapContract || !outputAmount || !inputAmount || !positions) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'swap'

      const subtractSlippage = toBN(toHex(outputAmount.quotient))
        .multipliedBy((100 - Number(slippage)) / 100)
        .toFixed(0, 1)

      const args = [...positions, toHex(inputAmount.quotient), subtractSlippage, deadlineValue]

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
  }, [account, library, swapContract, outputAmount, positions, inputAmount, slippage, deadlineValue])

  return useMemo(() => {
    if (!account || !chainId || !library || !swapContract || !inputCurrency || !outputCurrency || !outputAmount) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!inputAmount || !outputAmount) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: TransactionCallbackState.VALID,
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
            const summary = `Swap ${inputAmount?.toSignificant()} ${
              inputCurrency?.symbol
            } for ${outputAmount?.toSignificant()} ${outputCurrency?.symbol}`
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
    inputCurrency,
    outputCurrency,
    inputAmount,
    outputAmount,
  ])
}
