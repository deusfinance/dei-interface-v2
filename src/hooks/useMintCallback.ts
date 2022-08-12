import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { useCollateralPoolContract } from './useContract'

import { useTransactionAdder } from 'state/transactions/hooks'
import { CollateralPoolErrorToUserReadableMessage } from 'utils/parseError'
import toast from 'react-hot-toast'
import { toHex } from 'utils/hex'
import { calculateGasMargin } from 'utils/web3'

export enum MintCallbackState {
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  VALID = 'VALID',
}

export default function useMintCallback(deiAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined): {
  state: MintCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const collateralPoolContract = useCollateralPoolContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !collateralPoolContract || !deiAmount) {
        throw new Error('Missing dependencies.')
      }

      const args = [toHex(deiAmount.quotient)]

      return {
        address: collateralPoolContract.address,
        calldata: collateralPoolContract.interface.encodeFunctionData('mint', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, collateralPoolContract, deiAmount])

  return useMemo(() => {
    if (!account || !chainId || !library || !collateralPoolContract) {
      return {
        state: MintCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!deiAmount) {
      return {
        state: MintCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: MintCallbackState.VALID,
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
              toast.error(CollateralPoolErrorToUserReadableMessage(callError))
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
            const summary = `Mint ${deiAmount?.toSignificant()} DEI`
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
  }, [account, chainId, library, collateralPoolContract, deiAmount, constructCall, addTransaction])
}
