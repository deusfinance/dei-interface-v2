import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import METRICS_LOGO from '/public/static/images/pages/analytics/DEI_Analytics.svg'

import Hero from 'components/Hero'
import { Container, Title } from 'components/App/StableCoin'
import { RowCenter } from 'components/Row'
import DeiStats from 'components/App/Metrics/DeiStats'
import DeusStats from 'components/App/Metrics/DeusStats'

const Wrapper = styled(RowCenter)`
  max-width: 1300px;
  margin-top: 28px;
  gap: 32px;
  flex-wrap: wrap;
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  padding: 24px 16px;
  padding-bottom: 32px;
  background: ${({ theme }) => theme.bg0};
  ${({ theme }) => theme.mediaWidth.upToMedium`
  gap: 10px;
`};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  gap: 8px;
`};

  & > * {
    width: 100%;
  }
`

export default function Metrics() {
  return (
    <Container>
      <Hero>
        <Image src={METRICS_LOGO} height={'80px'} alt="Metrics logo" />
        <Title>Metrics</Title>
      </Hero>
      <Wrapper>
        <DeiStats />
        <DeusStats />
        {/* <VeDeusStats /> */}
      </Wrapper>
    </Container>
  )
}
