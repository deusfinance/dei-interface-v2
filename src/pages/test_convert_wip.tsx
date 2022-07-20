import React from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Deposits, Claimable, Balance, Convert as ConvertStake } from 'components/App/Convert'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const InfoRow = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 5px;
  width: 100%;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 900px);
  gap: 15px;
`

export default function Convert() {
  return (
    <Container>
      <Hero>
        Convert
        <HeroSubtext>
          Convert SOLID tokens and SOLID NFTs to SOLIDfluid and stake it to earn boosted rewards. Note: this process is
          not reversible.
        </HeroSubtext>
      </Hero>
      <Wrapper>
        <InfoRow>
          <Deposits />
          <Claimable />
          <Balance />
        </InfoRow>
        <ConvertStake />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
