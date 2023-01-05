// import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import Hero from 'components/Hero'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/stake/ic_stake.svg'
import { LiquidityPool as LiquidityPoolList, Stakings } from 'constants/stakingPools'
import LiquidityPool from 'components/App/Staking/LiquidityPool'
import PoolInfo from 'components/App/Staking/PoolInfo'
import PoolShare from 'components/App/Staking/PoolShare'
import AvailableLP from 'components/App/Staking/AvailableLP'
import StakedLP from 'components/App/Staking/LPStaked'
import Reading from 'components/App/Staking/PoolDetails'
import BalanceToken from 'components/App/Staking/BalanceToken'
import { VStack } from 'components/App/Staking/common/Layout'
import StatsHeader from 'components/StatsHeader'
import { useMemo } from 'react'
import { useCustomCoingeckoPrice, useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'
import { usePoolBalances } from 'hooks/useStablePoolInfo'
import { formatDollarAmount } from 'utils/numbers'
import { useGetDeusApy } from 'hooks/useStakingInfo'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div<{ isMultipleColumns: boolean }>`
  display: ${({ isMultipleColumns }) => (isMultipleColumns ? 'grid' : 'flex')};
  grid-template-columns: 480px 480px;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   display: flex;
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

export default function StakingPage() {
  const router = useRouter()
  const { pid } = router.query
  const pidNumber = Number(pid)
  const pool = LiquidityPoolList.find((pool) => pool.id === pidNumber) || LiquidityPoolList[0]
  const stakingPool = Stakings.find((p) => p.id === pool.id) || Stakings[0]
  const primaryApy = stakingPool.aprHook(stakingPool)
  const secondaryApy = useGetDeusApy(pool, stakingPool)
  const totalApy = primaryApy + secondaryApy
  const { rewardTokens } = stakingPool
  const poolBalances = usePoolBalances(pool)
  // FIXME: check this for single stakings
  const totalLockedValue = poolBalances[1] * 2 * Number(useCustomCoingeckoPrice(pool.priceToken?.symbol ?? 'DEI'))

  function onSelect(pid: number) {
    router.push(`/stake/manage/${pid}`)
  }

  const items = [
    {
      name: 'APR',
      value: totalApy.toFixed(0) + '%',
      hasTooltip: true,
      toolTipInfo: primaryApy.toFixed(0) + '% vDEUS + ' + secondaryApy.toFixed(0) + '% DEUS',
    },
    { name: 'TVL', value: formatDollarAmount(totalLockedValue) },
  ]

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={185} height={133} alt={`Logo`} />
        <StatsHeader pid={pidNumber} onSelectDropDown={onSelect} items={items} />
      </Hero>

      <TopWrapper isMultipleColumns={pool?.tokens.length > 1}>
        {pool?.tokens.length > 1 && (
          <VStack style={{ width: '100%' }}>
            <BalanceToken pool={pool} />
            <LiquidityPool pool={pool} />
          </VStack>
        )}
        <div style={{ width: '100%' }}>
          <AvailableLP pool={pool} />
          <StakedLP pid={pidNumber} />
          <PoolShare pool={pool} />
          <PoolInfo pool={pool} />
          <Reading />
        </div>
      </TopWrapper>
    </Container>
  )
}
