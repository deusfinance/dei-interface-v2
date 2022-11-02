// import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
// import { Stakings } from 'constants/stakingPools'
// import StatsHeader from 'components/StatsHeader'
// import LiquidityPool from 'components/App/Staking/LiquidityPool'
// import StakingPool from 'components/App/Staking/StakingPool'

import { default as CollateralTable } from 'components/App/Lending/CollateralTable'
import { default as AssetsTable } from 'components/App/Lending/AssetsTable'

import { LendingPool } from 'constants/lendingPools'
import { isMobile } from 'react-device-detect'

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

const TablesWrapper = styled.div`
  display: flex;
  margin-top: 10px;
`

const CollateralWrap = styled.div`
  padding: 5px;
`
const AssetsWrap = styled.div`
  padding: 5px;
`

export default function StakingPage() {
  const router = useRouter()
  const { pid } = router.query
  const pidNumber = Number(pid)

  const snapshotList = LendingPool

  // const pool = Stakings.find((pool) => pool.pid === pidNumber) || Stakings[0]

  // const items = useMemo(
  //   () => [
  //     { name: 'APR', value: '4%' },
  //     { name: 'TVL', value: '$4.58m' },
  //     { name: 'Your Stake', value: `3,120.00 ${pool?.lpToken?.symbol}` },
  //   ],
  //   [pool?.lpToken?.symbol]
  // )

  // function onSelect(pid: number) {
  //   router.push(`/stake/${pid}`)
  // }

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>
      {/* <StatsHeader items={items} pid={pidNumber} onSelectDropDown={onSelect} /> */}

      <div>Lending page: pool: {pidNumber}</div>
      <TablesWrapper>
        <CollateralWrap>
          <div>Collaterals</div>
          <CollateralTable pool={snapshotList[pidNumber]} isMobile={isMobile} isLoading={true} />
        </CollateralWrap>
        <AssetsWrap>
          <div>Assets</div>

          <AssetsTable pool={snapshotList[pidNumber]} isMobile={isMobile} isLoading={true} />
        </AssetsWrap>
      </TablesWrapper>

      <TopWrapper>
        {/* {pool?.tokens.length > 1 && <LiquidityPool pool={pool} />} */}
        {/* <StakingPool pool={pool} /> */}
      </TopWrapper>

      <Disclaimer />
    </Container>
  )
}
