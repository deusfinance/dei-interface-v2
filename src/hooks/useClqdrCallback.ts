import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useCLQDRContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { CollateralPoolErrorToUserReadableMessage } from 'utils/parseError'
import { toBN } from 'utils/numbers'
import { useCalcSharesFromAmount } from 'hooks/useClqdrPage'

export enum MintCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export function useDepositLQDRCallback(amountIn: string): {
  state: MintCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const CLQDRContract = useCLQDRContract()
  const shares = useCalcSharesFromAmount(amountIn)

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !CLQDRContract) {
        throw new Error('Missing dependencies.')
      }

      const amountInBN = toBN(amountIn).times(1e18).toFixed(0)
      const args = [amountInBN, shares]
      return {
        address: CLQDRContract.address,
        calldata: CLQDRContract.interface.encodeFunctionData('deposit', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, CLQDRContract, amountIn, shares])

  return useMemo(() => {
    if (!account || !chainId || !library || !CLQDRContract) {
      return {
        state: MintCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: MintCallbackState.VALID,
      error: null,
      callback: async function onCollectDeus(): Promise<string> {
        console.log('onDeposit callback')
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

        console.log('Deposit LQDR TRANSACTION', { tx, value })

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
            const summary = `Minting ${toBN(shares).div(1e18).toFixed()} cLQDR by ${amountIn} LQDR`
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
  }, [account, chainId, library, shares, CLQDRContract, amountIn, constructCall, addTransaction])
}
