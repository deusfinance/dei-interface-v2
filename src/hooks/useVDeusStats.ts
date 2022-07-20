import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import { useSingleContractMultipleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useVDeusContract, useVDeusStakingContract } from './useContract'
import useWeb3React from './useWeb3'
import { UserDeposit } from 'constants/stakings'

export const VDEUS_USDC_FACTOR = 6

export function useVDeusStats(): {
  numberOfVouchers: number
  listOfVouchers: Array<number>
} {
  const { account } = useWeb3React()

  const vDeusContract = useVDeusContract()

  const calls = !account
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [account],
        },
      ]

  const [vDeusBalance] = useSingleContractMultipleMethods(vDeusContract, calls)

  const { numberOfVouchers } = useMemo(() => {
    return {
      numberOfVouchers: vDeusBalance?.result ? toBN(formatUnits(vDeusBalance.result[0], 0)).toNumber() : 0,
    }
  }, [vDeusBalance])

  const idMapping = Array.from(Array(numberOfVouchers).keys())

  const callInputs = useMemo(() => {
    return !account ? [] : idMapping.map((id) => [account, id])
  }, [account, idMapping])

  const results = useSingleContractMultipleData(vDeusContract, 'tokenOfOwnerByIndex', callInputs)

  const listOfVouchers = useMemo(() => {
    return results
      .reduce((acc: number[], value) => {
        if (!value.result) return acc
        const result = value.result[0].toString()
        if (!result) return acc
        acc.push(parseInt(result))
        return acc
      }, [])
      .sort((a: number, b: number) => (a > b ? 1 : -1))
  }, [results])

  return {
    numberOfVouchers,
    listOfVouchers,
  }
}

export function useUserLockedNfts(): UserDeposit[] | null {
  const { account } = useWeb3React()
  const stakingContract = useVDeusStakingContract()
  const calls = !account ? [] : [{ methodName: 'userNftDeposits', callInputs: [account] }]

  const [result] = useSingleContractMultipleMethods(stakingContract, calls)

  const userNFTs: UserDeposit[] | null = useMemo(() => {
    if (!result || !result.result || !result.result.length) return null
    return result.result[0].map(
      (nft: any) =>
        ({
          nftId: toBN(nft.nftId.toString()).toNumber(),
          amount: toBN(nft.amount.toString()).toNumber(),
          depositTimestamp: toBN(nft.depositTimestamp.toString()).toNumber(),
          isWithdrawn: nft.isWithdrawn,
        } as UserDeposit)
    )
  }, [result])

  const nftPoolCalls = !userNFTs?.length
    ? []
    : userNFTs.map((nft) => ({ methodName: 'nftPool', callInputs: [nft.nftId] }))

  const nftPoolResult = useSingleContractMultipleMethods(stakingContract, nftPoolCalls)

  const nftPools: number[] | null = useMemo(() => {
    if (!nftPoolResult || !nftPoolResult.length || !userNFTs) return null
    return nftPoolResult.map((nftPool: any) =>
      nftPool.result?.length ? toBN(nftPool.result[0].toString()).toNumber() : 0
    )
  }, [nftPoolResult, userNFTs])

  return useMemo(() => {
    if (!userNFTs || !nftPools) return null
    return userNFTs.map((nft, index: number) => {
      return { ...nft, poolId: nftPools[index] } as UserDeposit
    })
  }, [userNFTs, nftPools])
}
