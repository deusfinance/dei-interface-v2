import { ExternalStakingType } from 'constants/stakingPools'
import { useEffect, useState } from 'react'
import { makeHttpRequest } from 'utils/http'

const SOLIDLY_API_URL = 'https://api-mainnet.solidly.com/api/v1/pairs'

export function useSolidlyApy(stakingPool: ExternalStakingType): number {
  const { apr } = useSolidlyStats(stakingPool.contract)
  return apr
}

export function useSolidlyTvl(stakingPool: ExternalStakingType): number {
  const { tvl } = useSolidlyStats(stakingPool.contract)
  return tvl
}

export default function useSolidlyStats(lpPoolAddress: string): {
  apr: number
  tvl: number
} {
  const [apr, setApr] = useState(0)
  const [tvl, setTvl] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const result = await makeHttpRequest(SOLIDLY_API_URL)
      const poolData = result.data.find((pool: any) => pool.address === lpPoolAddress)
      setTvl(poolData.totalTvlUsd)
      setApr(poolData.totalLpApr.current)
    }
    fetchStats()
  }, [lpPoolAddress])

  return {
    apr,
    tvl,
  }
}
