import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import { Z_INDEX } from 'theme'

import useOnOutsideClick from 'hooks/useOnOutsideClick'

import {
  NavToggle,
  IconWrapper,
  Dashboard as DashboardIcon,
  VeDeus as VeDeusIcon,
  Mint as MintIcon,
  Redeem as RedeemIcon,
  DeiBonds as DeiBondsIcon,
  Analytics as AnalyticsIcon,
} from 'components/Icons'
import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
`

const InlineModal = styled(Card)<{
  isOpen: boolean
}>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  width: 220px;
  transform: translateX(-220px) translateY(15px);
  z-index: ${Z_INDEX.modal};
  gap: 12px;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 10px;
`

const Row = styled.div<{
  active?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text1};
  }

  ${({ active, theme }) =>
    active &&
    ` color: ${theme.yellow4};
      pointer-events: none;
  `};
`

// TODO ADD PROPER ICONS
export default function Menu() {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  return (
    <Container ref={ref}>
      <NavToggle onClick={() => toggle()} />
      <div>
        <InlineModal isOpen={isOpen}>
          <Link href="/dashboard" passHref>
            <Row active={router.route === '/dashboard'}>
              <div>Dashboard</div>
              <IconWrapper>
                <DashboardIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/vest" passHref>
            <Row active={router.route === '/vest'}>
              <div>veDEUS</div>
              <IconWrapper>
                <VeDeusIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/mint" passHref>
            <Row active={router.route === '/mint'}>
              <div>Mint DEI</div>
              <IconWrapper>
                <MintIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/redemption" passHref>
            <Row active={router.route === '/redemption'}>
              <div>Redemption</div>
              <IconWrapper>
                <RedeemIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/deibonds" passHref>
            <Row active={router.route === '/deibonds'}>
              <div>DEI-Bonds</div>
              <IconWrapper>
                <DeiBondsIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/analytics" passHref>
            <Row active={router.route === '/analytics'}>
              <div>Analytics</div>
              <IconWrapper>
                <AnalyticsIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <ExternalLink href="https://twitter.com/deusdao">
            <Row onClick={() => toggle()}>
              <div>Twitter</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://t.me/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Community</div>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://github.com/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Github</div>
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
