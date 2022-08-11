import React from 'react'
import styled from 'styled-components'

import { useInjectedAddress } from 'hooks/useInjectedAddress'

import NavBar from './NavBar'
import Warning from './Warning'
import Footer from 'components/Disclaimer'

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-flow: column nowrap;
`

// Scroll content so we can use a semi transparent navbar.
const Content = styled.div`
  position: relative;
  /* height: calc(100vh - 55px - 70px); */
  min-height: calc(970px - 55px - 87px);
  overflow: scroll;
  padding-bottom: 20px;

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
      <NavBar />
      {hasInjected && (
        <Warning message={`❌ You are in "READ-ONLY" mode. Please do not confirm any transactions! ❌ `} />
      )}
      <Content>{children}</Content>
      <Footer />
    </Wrapper>
  )
}
