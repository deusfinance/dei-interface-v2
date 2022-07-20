import React from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { vDeusStakingPools } from 'constants/stakings'
import PoolStake from 'components/App/NFT/PoolStake'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  & > * {
    &:nth-child(2) {
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  max-width: 1200px;
  align-items: flex-start;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    flex-flow: column nowrap;
  `}
`

export default function NFT() {
  return (
    <Container>
      <Hero>
        <span>vDEUS Staking</span>
        <HeroSubtext>deposit your DEUS voucher and earn.</HeroSubtext>
      </Hero>
      <TopWrapper>
        {vDeusStakingPools.map((pool) => (
          <PoolStake key={pool.name} pool={pool}></PoolStake>
        ))}
      </TopWrapper>
      <Disclaimer />
    </Container>
  )
}
