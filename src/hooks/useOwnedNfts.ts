import { useMemo } from 'react'
import { useSingleContractMultipleData } from 'state/multicall/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useContract, useVeDeusContract } from 'hooks/useContract'

import VEDEUS_ABI from 'constants/abi/VEDEUS.json'
import { DeiBonder } from 'constants/addresses'

//TODO: build an array with balanceOf(account) size
const idMapping = Array.from(Array(100).keys())

//TODO: remove it and use useOwnerNfts()
export default function useOwnedNfts(): number[] {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId])

  const results = useSingleContractMultipleData(veDEUSContract, 'tokenOfOwnerByIndex', callInputs)

  return useMemo(() => {
    return results
      .reduce((acc: number[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result || result === '0') return acc
        acc.push(parseInt(result))
        return acc
      }, [])
      .sort((a: number, b: number) => (a > b ? 1 : -1))
  }, [results])
}

export function useOwnerNfts(address: string | null | undefined, ABI: any): number[] {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const ERC721Contract = useContract(address, ABI)

  const callInputs = useMemo(() => {
    return !chainId || !isSupportedChainId || !account ? [] : idMapping.map((id) => [account, id])
  }, [account, chainId, isSupportedChainId])

  const results = useSingleContractMultipleData(ERC721Contract, 'tokenOfOwnerByIndex', callInputs)

  return useMemo(() => {
    return results
      .reduce((acc: number[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result || result === '0') return acc
        acc.push(parseInt(result))
        return acc
      }, [])
      .sort((a: number, b: number) => (a > b ? 1 : -1))
  }, [results])
}

export function useOwnerBondNFT(): number[] {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DeiBonder[chainId] : undefined), [chainId])
  return useOwnerNfts(address, VEDEUS_ABI) //use erc721 abi
}
