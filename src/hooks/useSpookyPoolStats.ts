import { useEffect, useState } from 'react'
import { ExternalStakingType } from 'constants/stakingPools'
import { initializeSpookyApolloClient } from 'apollo/spooky/spookyClient'
import { GetSpookyPoolsData } from 'apollo/spooky/spookyQueries'

export function useGetSpookyTvl(stakingPool: ExternalStakingType): number {
  const poolId = stakingPool.contract
  const { tvl } = useGetSpookyPoolStats(poolId)
  if (!stakingPool.contract?.length) return 0
  return tvl
}

export function useGetSpookyApy(stakingPool: ExternalStakingType): number {
  const poolId = stakingPool.contract
  const { apr } = useGetSpookyPoolStats(poolId)
  if (!stakingPool.contract?.length) return 0
  return apr * 100
}

export function useGetSpookyPoolStats(poolId: string): { apr: number; tvl: number } {
  const [apr, setApr] = useState(0)
  const [tvl, setTvl] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const client = initializeSpookyApolloClient()
      const { data } = await client.query({
        query: GetSpookyPoolsData,
        variables: { id: poolId },
      })
      setApr(0)
      setTvl(data.pairs[0].reserveUSD)
    }
    fetchStats()
  }, [poolId])

  return {
    apr,
    tvl,
  }
}
