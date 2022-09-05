import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useVDeusStakingContract } from './useContract'
import useWeb3React from './useWeb3'
import { UserDeposit } from 'constants/stakings'

export const VDEUS_USDC_FACTOR = 6

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
