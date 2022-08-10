import { useMemo } from 'react'
import { useSingleContractMultipleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useContract, useVeDeusContract } from 'hooks/useContract'

import ERC721_ABI from 'constants/abi/ERC721.json'
import { DeiBondRedeemNFT } from 'constants/addresses'
import { toBN } from 'utils/numbers'
import { formatUnits } from '@ethersproject/units'
import useDebounce from './useDebounce'

//TODO: build an array with balanceOf(account) size
const idMapping = Array.from(Array(100).keys())

//TODO: remove it and use useOwnerNfts()
export default function useOwnedNfts(): { results: number[]; isLoading: boolean } {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId])

  const results = useSingleContractMultipleData(veDEUSContract, 'tokenOfOwnerByIndex', callInputs)
  const isLoading = useDebounce(results[0]?.loading, 2000)

  return useMemo(() => {
    return {
      results: results
        .reduce((acc: number[], value) => {
          if (!value.result) return acc
          const result = value.result[0].toString()
          if (!result || result === '0') return acc
          acc.push(parseInt(result))
          return acc
        }, [])
        .sort((a: number, b: number) => (a > b ? 1 : -1)),
      isLoading,
    }
  }, [isLoading, results])
}

export function useOwnerNfts(address: string | null | undefined, ABI?: any): { results: number[]; isLoading: boolean } {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const ERC721Contract = useContract(address, ABI || ERC721_ABI)

  const calls = !account
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [account],
        },
      ]

  const [balanceOf] = useSingleContractMultipleMethods(ERC721Contract, calls)

  const { balanceOfValue } = useMemo(() => {
    return {
      balanceOfValue: balanceOf?.result ? toBN(formatUnits(balanceOf.result[0], 0)).toNumber() : 0,
    }
  }, [balanceOf])

  const idMapping2 = useMemo(() => {
    return Array.from(Array(balanceOfValue).keys())
  }, [balanceOfValue])

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping2.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId, idMapping2])

  const results = useSingleContractMultipleData(ERC721Contract, 'tokenOfOwnerByIndex', callInputs)
  const isLoading = useDebounce(results[0]?.loading, 2000)

  return useMemo(() => {
    return {
      results: results
        .reduce((acc: number[], value) => {
          if (!value.result) return acc
          const result = value.result[0].toString()
          if (!result || result === '0') return acc
          acc.push(parseInt(result))
          return acc
        }, [])
        .sort((a: number, b: number) => (a > b ? 1 : -1)),
      isLoading,
    }
  }, [results])
}

export function useOwnerBondNFTs(): { results: number[]; isLoading: boolean } {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DeiBondRedeemNFT[chainId] : undefined), [chainId])
  return useOwnerNfts(address) //use erc721 abi
}
