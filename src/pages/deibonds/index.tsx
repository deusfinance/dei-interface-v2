import React, { useState } from 'react'
import styled from 'styled-components'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Navigation, NavigationTypes } from 'components/StableCoin'
import Mint from 'components/App/Bonds/mint'
import Redeem from 'components/App/Bonds/redeem'
import Swap from 'components/App/Bonds/swap'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const SelectorContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  margin-top: 24px;
  padding-right: 24px;
`

export default function Bonds() {
  const [selected, setSelected] = useState<NavigationTypes>(NavigationTypes.MINT)

  const getAppComponent = (): JSX.Element => {
    if (selected == NavigationTypes.MINT) {
      return <Mint onSwitch={setSelected} />
    }
    if (selected == NavigationTypes.SWAP) {
      return <Swap onSwitch={setSelected} />
    }
    if (selected == NavigationTypes.REDEEM) {
      return <Redeem />
    }
    return <Mint onSwitch={setSelected} />
  }

  return (
    <Container>
      <Hero>
        <div>DEI Bonds</div>
        <HeroSubtext>Mint and Swap bDEI</HeroSubtext>
      </Hero>

      <SelectorContainer>
        <Navigation selected={selected} setSelected={setSelected} />
      </SelectorContainer>

      {getAppComponent()}

      <Disclaimer />
    </Container>
  )
}
