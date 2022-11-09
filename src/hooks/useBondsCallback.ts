import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'

import nft_data from 'constants/files/nft_data.json'
import { INFO_URL } from 'constants/misc'
import { toBN } from 'utils/numbers'
import { makeHttpRequest } from 'utils/http'
import { createTransactionCallback, TransactionCallbackState } from 'utils/web3'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from './useWeb3'
import { useDeiBonderV3Contract } from './useContract'

export default function useMigrateNftToDeiCallback(
  tokenId: number,
  claimAmount: BigNumber | null
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const deiBonderV3Contract = useDeiBonderV3Contract()

  const nft = useMemo(() => nft_data.filter((nft) => nft.tokenId == tokenId)[0], [tokenId])

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
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    const methodName = 'migrateNFTToDEI'
    const summary = `Migrate DeiBond #${tokenId} with ${claimAmount?.toString()} bDEI`

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () => createTransactionCallback(methodName, constructCall, addTransaction, summary, account, library),
    }
  }, [account, chainId, library, deiBonderV3Contract, tokenId, claimAmount, constructCall, addTransaction])
}

export function useClaimDEICallback(claimAmount: BigNumber): {
  state: TransactionCallbackState
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
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    const methodName = 'claimDEI'
    const summary = `Claim ${claimAmount} DEI `

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () => createTransactionCallback(methodName, constructCall, addTransaction, summary, account, library),
    }
  }, [account, chainId, library, deiBonderV3Contract, claimAmount, constructCall, addTransaction])
}
