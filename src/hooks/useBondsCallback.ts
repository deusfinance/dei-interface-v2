import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import toast from 'react-hot-toast'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import nft_data from 'constants/files/nft_data.json'
import { INFO_URL } from 'constants/misc'
import { DefaultHandlerError } from 'utils/parseError'
import { toBN } from 'utils/numbers'
import { makeHttpRequest } from 'utils/http'
import { calculateGasMargin } from 'utils/web3'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from './useWeb3'
import { useDeiBonderV3Contract } from './useContract'

export enum MigrateCallbackState {
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  VALID = 'VALID',
}

export default function useMigrateNftToDeiCallback(
  tokenId: number,
  claimAmount: BigNumber | null
): {
  state: MigrateCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const deiBonderV3Contract = useDeiBonderV3Contract()

  const nft = useMemo(() => nft_data.filter((nft) => nft.tokenId == tokenId)[0], [tokenId])

  //TODO
  //it should get proof data from the api
  const getProofDate = useCallback(async () => {
    try {
      // if (!tokenId) throw new Error(`tokenId didn't selected`)
      const { href: url } = new URL(`/bond-merkle/nft/proof/${tokenId}/`, INFO_URL) //TODO
      return makeHttpRequest(url)
    } catch (err) {
      throw err
    }
  }, [tokenId])

  const constructCall = useCallback(async () => {
    console.log({ tokenId, claimAmount, nft })
    try {
      if (!account || !library || !deiBonderV3Contract || !claimAmount || !nft) {
        throw new Error('Missing dependencies.')
      }
      const proofResponse = await getProofDate()
      const proof = proofResponse['proof']
      const { maturity_time, amount } = proofResponse['value']
      const args = [tokenId, amount, maturity_time, claimAmount.times(1e18).toString(), proof]

      console.log({ args })
      return {
        address: deiBonderV3Contract.address,
        calldata: deiBonderV3Contract.interface.encodeFunctionData('migrateNFTToDEI', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, deiBonderV3Contract, tokenId, claimAmount, nft, getProofDate])

  return useMemo(() => {
    if (!account || !chainId || !library || !deiBonderV3Contract) {
      return {
        state: MigrateCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: MigrateCallbackState.VALID,
      error: null,
      callback: async function onMigrateNFT(): Promise<string> {
        console.log('onMigrateNFT callback')
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
            const summary = `Migrate DeiBond #${tokenId} with ${claimAmount?.toString()} bDEI`
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
  }, [account, chainId, library, deiBonderV3Contract, tokenId, claimAmount, constructCall, addTransaction])
}

export function useClaimDEICallback(claimAmount: BigNumber): {
  state: MigrateCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const deiBonderV3Contract = useDeiBonderV3Contract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !deiBonderV3Contract || !claimAmount) {
        throw new Error('Missing dependencies.')
      }
      const args = [toBN(claimAmount).times(1e18).toString()]

      return {
        address: deiBonderV3Contract.address,
        calldata: deiBonderV3Contract.interface.encodeFunctionData('claimDEI', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, deiBonderV3Contract, claimAmount])

  return useMemo(() => {
    if (!account || !chainId || !library || !deiBonderV3Contract) {
      return {
        state: MigrateCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: MigrateCallbackState.VALID,
      error: null,
      callback: async function onClaimDEI(): Promise<string> {
        console.log('onClaimDEI callback')
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
            const summary = `Claim ${claimAmount} DEI `
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
  }, [account, chainId, library, deiBonderV3Contract, claimAmount, constructCall, addTransaction])
}
