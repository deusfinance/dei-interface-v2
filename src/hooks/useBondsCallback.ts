import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useDeiBonderContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { toHex } from 'utils/hex'
import { DefaultHandlerError } from 'utils/parseError'

export enum RedeemCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useBondsCallback(
  deiCurrency: Currency | undefined | null,
  deiAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined
): {
  state: RedeemCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const DeiBonder = useDeiBonderContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !DeiBonder || !deiAmount) {
        throw new Error('Missing dependencies.')
      }

      const methodName = 'bondDEI'
      const args = [toHex(deiAmount.quotient)]

      return {
        address: DeiBonder.address,
        calldata: DeiBonder.interface.encodeFunctionData(methodName, args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, DeiBonder, deiAmount])

  return useMemo(() => {
    if (!account || !chainId || !library || !DeiBonder || !deiCurrency || !deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!deiAmount) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: RedeemCallbackState.VALID,
      error: null,
      callback: async function onMint(): Promise<string> {
        console.log('onMint callback')
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

        console.log('MINT TRANSACTION', { tx, value })

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
            const summary = `Mint ${deiAmount?.toSignificant()} bDEI & 1 Time Reduction NFT `
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
  }, [account, chainId, library, addTransaction, constructCall, DeiBonder, deiCurrency, deiAmount])
}
