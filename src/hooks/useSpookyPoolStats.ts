import { useEffect, useMemo, useState } from 'react'
import { ExternalStakingType } from 'constants/stakingPools'
import { initializeSpookyApolloClient } from 'apollo/spooky/spookyClient'
import { GetSpookyPoolsData } from 'apollo/spooky/spookyQueries'
import { useSpookyLiquidityPoolContract } from './useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { formatUnits } from '@ethersproject/units'
import { toBN } from 'utils/numbers'
import { useCustomCoingeckoPrice } from './useCoingeckoPrice'

export function useGetSpookyTvl(stakingPool: ExternalStakingType): number {
  //   const poolId = stakingPool.contract
  //   const { tvl } = useGetSpookyPoolStats(poolId)
  //   if (!stakingPool.contract?.length) return 0

  const contract = useSpookyLiquidityPoolContract(stakingPool)
  const token0 = stakingPool.tokens[0]
  const token1 = stakingPool.tokens[1]

  const priceOfToken0 = useCustomCoingeckoPrice(token0.symbol ?? '')
  const priceOfToken1 = useCustomCoingeckoPrice(token1.symbol ?? '')

  const methodCalls = useMemo(
    () => [
      {
        methodName: 'getReserves',
        callInputs: [],
      },
    ],
    []
  )

  const [tokenReservesRaw] = useSingleContractMultipleMethods(contract, methodCalls)

  const { tokenReserve0, tokenReserve1 } = useMemo(() => {
    return {
      tokenReserve0: tokenReservesRaw?.result
        ? toBN(formatUnits(tokenReservesRaw.result[0], token0.decimals)).toNumber()
        : 0,
      tokenReserve1: tokenReservesRaw?.result
        ? toBN(formatUnits(tokenReservesRaw.result[1], token1.decimals)).toNumber()
        : 0,
    }
  }, [token0, token1, tokenReservesRaw])

  const tvl = tokenReserve0 * parseFloat(priceOfToken0) + tokenReserve1 * parseFloat(priceOfToken1)
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
      //   console.log(
      //     data.pairs[0].name,
      //     data.pairs[0].reserveUSD,
      //     data.pairs[0].volumeUSD,
      //     (data.pairs[0].volumeUSD * 0.002 * 365 * 100) / data.pairs[0].reserveUSD
      //   )
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
