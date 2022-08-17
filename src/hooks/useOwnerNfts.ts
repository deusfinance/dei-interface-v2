import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import ERC721_ABI from 'constants/abi/ERC721.json'
import { DeiBondRedeemNFT, veDEUS } from 'constants/addresses'
import { toBN } from 'utils/numbers'

import { useSingleContractMultipleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useDebounce from 'hooks/useDebounce'
import useWeb3React from 'hooks/useWeb3'
import { useContract } from 'hooks/useContract'

function useOwnerNfts(address: string | null | undefined, ABI?: any): { results: number[]; isLoading: boolean } {
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

  const idMapping = useMemo(() => {
    return Array.from(Array(balanceOfValue).keys())
  }, [balanceOfValue])

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId, idMapping])

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
  }, [results, isLoading])
}

export function useOwnerVeDeusNFTs(): { results: number[]; isLoading: boolean } {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDEUS[chainId] : undefined), [chainId])
  return useOwnerNfts(address)
}

export function useOwnerBondNFTs(): { results: number[]; isLoading: boolean } {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DeiBondRedeemNFT[chainId] : undefined), [chainId])
  return useOwnerNfts(address)
}
