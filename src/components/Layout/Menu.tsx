import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import { Z_INDEX } from 'theme'

import useOnOutsideClick from 'hooks/useOnOutsideClick'

import {
  NavToggle as NavToggleIcon,
  IconWrapper,
  Dashboard as DashboardIcon,
  Mint as MintIcon,
  Redeem as RedeemIcon,
  DeiBonds as DeiBondsIcon,
  Swap as SwapIcon,
} from 'components/Icons'
import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
`

const InlineModal = styled(Card)<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  width: 220px;
  transform: translateX(-220px) translateY(15px);
  z-index: ${Z_INDEX.modal};
  gap: 12px;
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border3};
  border-radius: 10px;
`

const Row = styled.div<{ active?: boolean }>`
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
    ` color: ${theme.darkPink};
      font-weight: 700;
      pointer-events: none;
  `};
`

const NavToggle = styled(NavToggleIcon)`
  &:hover,
  &:focus {
    filter: brightness(1.5);
    cursor: pointer;
  }
`

const Separator = styled.div`
  width: 225px;
  margin-left: -13px;
  height: 1px;
  background: ${({ theme }) => theme.bg4};
`

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
              <div>Redeem DEI</div>
              <IconWrapper>
                <RedeemIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>

          <Link href="/stake" passHref>
            <Row active={router.route === '/stake'}>
              <div>Pools</div>
              <IconWrapper>
                <DeiBondsIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>

          <Link href="/swap" passHref>
            <Row active={router.route === '/swap'}>
              <div>Swap</div>
              <IconWrapper>
                <SwapIcon size={20} color={'#FFF'} />
              </IconWrapper>
            </Row>
          </Link>

          <Separator />

          <ExternalLink href="">
            <Row onClick={() => toggle()}>
              <div>Bug Bounty</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://docs.deus.finance">
            <Row onClick={() => toggle()}>
              <div>Docs</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://docs.deus.finance/contracts/disclaimer">
            <Row onClick={() => toggle()}>
              <div>Terms</div>
            </Row>
          </ExternalLink>

          <Separator />

          <ExternalLink href="https://discord.gg/xTTaBBAMgG">
            <Row onClick={() => toggle()}>
              <div>Discord</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://twitter.com/deusdao">
            <Row onClick={() => toggle()}>
              <div>Twitter</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://github.com/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Github</div>
            </Row>
          </ExternalLink>

          <ExternalLink href="https://t.me/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Telegram</div>
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
