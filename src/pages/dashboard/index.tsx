import React from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export default function Dashboard() {
  return (
    <Container>
      <Hero>
        <div>Dashboard</div>
        <HeroSubtext>Important stats about DEI and DEUS</HeroSubtext>
      </Hero>

      <Disclaimer />
    </Container>
  )
}
