import { useEffect, useState } from 'react'
import { initializeApolloClient } from 'apollo/beets/beetsClient'
import { ExternalStakingType } from 'constants/stakingPools'
import { GetBeetsPoolData } from 'apollo/beets/beetsQueries'

const ANOTHER_DEI_ANOTHER_DOLLAR = '0x4e415957aa4fd703ad701e43ee5335d1d7891d8300020000000000000000053b' // poolID of the pool

export function useGetBeetsTvl(stakingPool: ExternalStakingType): number {
  const poolId = stakingPool.contract != '' ? stakingPool.contract : ANOTHER_DEI_ANOTHER_DOLLAR
  const { tvl } = useGetBeetsPoolStats(poolId)
  if (!stakingPool.contract?.length) return 0
  return tvl
}

export function useGetBeetsApy(stakingPool: ExternalStakingType): number {
  const poolId = stakingPool.contract != '' ? stakingPool.contract : ANOTHER_DEI_ANOTHER_DOLLAR
  const { apr } = useGetBeetsPoolStats(poolId)
  if (!stakingPool.contract?.length) return 0
  return apr * 100
}

export function useGetBeetsPoolStats(poolId: string): { apr: number; tvl: number } {
  const [apr, setApr] = useState(0)
  const [tvl, setTvl] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const client = initializeApolloClient()
      const { data } = await client.query({
        query: GetBeetsPoolData,
        variables: { id: poolId },
      })
      setApr(data.poolGetPool.dynamicData.apr.total)
      setTvl(data.poolGetPool.dynamicData.totalLiquidity)
    }
    fetchStats()
  }, [poolId])

  return {
    apr,
    tvl,
  }
}
