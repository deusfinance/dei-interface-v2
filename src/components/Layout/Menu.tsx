import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import { Z_INDEX } from 'theme'

import useOnOutsideClick from 'hooks/useOnOutsideClick'

import {
  NavToggle,
  IconWrapper,
  Telegram as TelegramIcon,
  CreditCard as CreditCardIcon,
  Twitter as TwitterIcon,
  Github as GithubIcon,
  Lock as LockIcon,
  Redeem as RedeemIcon,
  Gift as GiftIcon,
  Portfolio as PortfolioIcon,
  Trade as TradeIcon,
} from 'components/Icons'
import { Card } from 'components/Card'
import { NavButton } from 'components/Button'
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
  gap: 10px;
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
    ` color: ${theme.text1};
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
      <NavButton onClick={() => toggle()}>
        <NavToggle />
      </NavButton>
      <div>
        <InlineModal isOpen={isOpen}>
          <Link href="/dashboard" passHref>
            <Row active={router.route === '/dashboard'}>
              <div>Dashboard</div>
              <IconWrapper>
                <CreditCardIcon size={20} />
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
              <div>DeiBonds</div>
              <IconWrapper>
                <TradeIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/deibonds/pools" passHref>
            <Row active={router.route === '/deibonds/pools'}>
              <div>Pools</div>
              <IconWrapper>
                <PortfolioIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/deibonds/liquidity" passHref>
            <Row active={router.route === '/deibonds/liquidity'}>
              <div>Liquidity</div>
              <IconWrapper>
                <PortfolioIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/vdeus" passHref>
            <Row active={router.route === '/vdeus'}>
              <div>vDEUS</div>
              <IconWrapper>
                <GiftIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/borrow" passHref>
            <Row active={router.route === '/borrow'}>
              <div>Borrow</div>
              <IconWrapper>
                <CreditCardIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/vest" passHref>
            <Row active={router.route === '/vest'}>
              <div>Vest</div>
              <IconWrapper>
                <LockIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <Link href="/rewards" passHref>
            <Row active={router.route === '/rewards'}>
              <div>Rewards</div>
              <IconWrapper>
                <GiftIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>
          <ExternalLink href="https://twitter.com/deusdao">
            <Row onClick={() => toggle()}>
              <div>Twitter</div>
              <IconWrapper>
                <TwitterIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://t.me/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Community</div>
              <IconWrapper>
                <TelegramIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
          <ExternalLink href="https://github.com/deusfinance">
            <Row onClick={() => toggle()}>
              <div>Github</div>
              <IconWrapper>
                <GithubIcon size={15} />
              </IconWrapper>
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
