import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import useWeb3React from './useWeb3'
import { useOracleContract } from './useContract'
import { useGetOracleAddress } from './useMintPage'

import { useTransactionAdder } from 'state/transactions/hooks'
import { DefaultHandlerError } from 'utils/parseError'
import { calculateGasMargin } from 'utils/web3'

export enum OracleCallbackState {
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  VALID = 'VALID',
}

export default function useUpdateCallback(): {
  state: OracleCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const address = useGetOracleAddress()
  const oracleTwapContract = useOracleContract(address)

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !oracleTwapContract) {
        throw new Error('Missing dependencies.')
      }

      return {
        address: oracleTwapContract.address,
        calldata: oracleTwapContract.interface.encodeFunctionData('update', []) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, oracleTwapContract])

  return useMemo(() => {
    if (!account || !chainId || !library || !oracleTwapContract) {
      return {
        state: OracleCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: OracleCallbackState.VALID,
      error: null,
      callback: async function onMint(): Promise<string> {
        console.log('onUpdate Oracle callback')
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

        console.log('UPDATE TRANSACTION', { tx, value })

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
                error: new Error(callError.message),
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
            const summary = `Update TWAP oracle price`
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
  }, [account, chainId, library, oracleTwapContract, constructCall, addTransaction])
}
