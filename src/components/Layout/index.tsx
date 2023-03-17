import React, { useState } from 'react'
import styled from 'styled-components'

import { useInjectedAddress } from 'hooks/useInjectedAddress'

import Slider from './Slider'
import Warning from './Warning'
import Web3Navbar from './Web3Navbar'
import RiskNotification from 'components/InfoHeader'
import { sendEvent } from 'components/analytics'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  background: ${({ theme }) => theme.bg0};
  /* overflow: hidden; */
`

const VerticalWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background: ${({ theme }) => theme.bg0};
`

const Content = styled.div`
  position: relative;
  min-height: calc(970px - 55px - 67px);
  overflow: scroll;
  padding-bottom: 50px;
  width: 100%;
  background: ${({ theme }) => theme.bg0};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom: 30px;
    height:100%;
  `}

  @media screen and (min-height: 1040px) {
    height: calc(100vh - 55px - 60px);
  }
`

export default function Layout({ children }: { children: React.ReactNode }) {
  const hasInjected = useInjectedAddress()
  const showBanner = localStorage.getItem('risk_warning') === 'true' ? false : true
  const [showTopBanner, setShowTopBanner] = useState(showBanner)
  const bannerText = 'Users interacting with this software do so entirely at their own risk'

  function setShowBanner(inp: boolean) {
    if (!inp) {
      localStorage.setItem('risk_warning', 'true')
      setShowTopBanner(false)
      sendEvent('click', { click_type: 'close_notification', click_action: 'risk_warning' })
    }
  }

  return (
    <VerticalWrapper>
      {showTopBanner && <RiskNotification onClose={setShowBanner} bg={'gray'} hasInfoIcon={true} text={bannerText} />}
      <Wrapper>
        <Slider />
        <div style={{ width: '100%' }}>
          {hasInjected && (
            <Warning>{`❌ You are in "READ-ONLY" mode. Please do not confirm any transactions! ❌ `}</Warning>
          )}
          <Web3Navbar />
          <Content>{children}</Content>
          {/* <Footer /> */}
        </div>
      </Wrapper>
    </VerticalWrapper>
  )
}
