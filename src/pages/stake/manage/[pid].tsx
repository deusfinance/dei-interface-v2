// import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import Hero from 'components/Hero'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/stake/ic_stake.svg'
import { LiquidityPool as LiquidityPoolList } from 'constants/stakingPools'
// import StatsHeader from 'components/StatsHeader'
import LiquidityPool from 'components/App/Staking/LiquidityPool'
import PoolInfo from 'components/App/Staking/PoolInfo'
import PoolShare from 'components/App/Staking/PoolShare'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin: auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
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

  // const items = useMemo(
  //   () => [
  //     { name: 'APR', value: '4%' },
  //     { name: 'TVL', value: '$4.58m' },
  //     { name: 'Total Staked', value: `3,120.00 ${pool?.lpToken?.symbol}` },
  //   ],
  //   [pool?.lpToken?.symbol]
  // )

  // function onSelect(pid: number) {
  //   router.push(`/stake/${pid}`)
  // }

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={185} height={133} alt={`Logo`} />
        {/* <StatsHeader items={items} pid={pidNumber} onSelectDropDown={onSelect} /> */}
      </Hero>

      <TopWrapper>
        {pool?.tokens.length > 1 && <LiquidityPool pool={pool} />}
        <div>
          <PoolInfo pool={pool} />
          <PoolShare pool={pool} />
        </div>
      </TopWrapper>
    </Container>
  )
}
