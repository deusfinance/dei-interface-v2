import React from 'react'
import styled from 'styled-components'

import { useInjectedAddress } from 'hooks/useInjectedAddress'

// import NavBar from './NavBar'
import NavBar2 from './NavBar2'
import Warning from './Warning'
import Footer from 'components/Disclaimer'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  /* overflow: hidden; */
`

const Content = styled.div`
  position: relative;
  min-height: calc(970px - 55px - 67px);
  overflow: scroll;
  padding-bottom: 50px;

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
      <NavBar2 />
      <div>
        {hasInjected && (
          <Warning message={`❌ You are in "READ-ONLY" mode. Please do not confirm any transactions! ❌ `} />
        )}
        <Content>{children}</Content>
        {/* <Footer /> */}
      </div>
    </Wrapper>
  )
}
