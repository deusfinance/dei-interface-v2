import { useMemo } from 'react'
import { useSingleContractMultipleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useContract, useVeDeusContract } from 'hooks/useContract'

import DEI_BOND_REDEEM_NFT from 'constants/abi/DEI_BOND_REDEEM_NFT.json'
import { DeiBondRedeemNFT } from 'constants/addresses'
import { toBN } from 'utils/numbers'
import { formatUnits } from '@ethersproject/units'

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

  const calls = !account
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [account],
        },
      ]

  const [vDeusBalance] = useSingleContractMultipleMethods(ERC721Contract, calls)

  const { numberOfVouchers } = useMemo(() => {
    return {
      numberOfVouchers: vDeusBalance?.result ? toBN(formatUnits(vDeusBalance.result[0], 0)).toNumber() : 0,
    }
  }, [vDeusBalance])

  // console.log({ calls, vDeusBalance, numberOfVouchers })

  const idMapping = Array.from(Array(numberOfVouchers).keys())

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
  const address = useMemo(() => (chainId ? DeiBondRedeemNFT[chainId] : undefined), [chainId])
  return useOwnerNfts(address, DEI_BOND_REDEEM_NFT) //use erc721 abi
}
