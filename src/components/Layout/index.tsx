import React from 'react'
import styled from 'styled-components'

import { useInjectedAddress } from 'hooks/useInjectedAddress'

// import NavBar from './NavBar'
import Slider from './Slider'
import Warning from './Warning'
import Web3Navbar from './Web3Navbar'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  background: ${({ theme }) => theme.bg0};
  /* overflow: hidden; */
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

  return (
    <Wrapper>
      {/* <NavBar /> */}
      <Slider />
      <div style={{ width: '100%' }}>
        {hasInjected && (
          <Warning message={`❌ You are in "READ-ONLY" mode. Please do not confirm any transactions! ❌ `} />
        )}
        <Web3Navbar />
        <Content>{children}</Content>
        {/* <Footer /> */}
      </div>
    </Wrapper>
  )
}
