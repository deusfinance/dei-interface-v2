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
      <NavBar />
      {hasInjected && (
        <Warning>{`❌ You are in "READ-ONLY" mode. Please do not confirm any transactions! ❌ `}</Warning>
      )}
      {/* <Warning>
        <>
          The DEUS team is actively monitoring the{' '}
          <ExternalLink
            href="https://twitter.com/WatcherGuru/status/1634263195706863618"
            style={{ textDecoration: 'underline', display: 'inline', color: 'black' }}
          >
            USDC situation
          </ExternalLink>
          . We started to actively diversify USDC backing of DEI into multiple stables. For more info, read the
          announcement on{' '}
          <ExternalLink
            style={{ textDecoration: 'underline', display: 'inline', color: 'black' }}
            href="https://discord.com/invite/deusfinance"
          >
            Discord
          </ExternalLink>
          .
        </>
      </Warning> */}
      <Content>{children}</Content>
      <Footer />
    </Wrapper>
  )
}
