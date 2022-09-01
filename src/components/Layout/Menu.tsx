import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Link from 'next/link'
import Image from 'next/image'
import { Z_INDEX } from 'theme'

import { sendEvent } from 'components/analytics'
import LEGACY_DEI_LOGO from '/public/static/images/LegacyDeiLogo.svg'
import { Link as LinkIcon } from 'components/Icons'
import useOnOutsideClick from 'hooks/useOnOutsideClick'

// import MENU_NEW from '/public/static/images/ic_menu_new.svg'
import DOT_NEW from '/public/static/images/ic_dot_new.svg'

import {
  NavToggle as NavToggleIcon,
  IconWrapper,
  Dashboard as DashboardIcon,
  VeDeus as VeDeusIcon,
  Mint as MintIcon,
  Redeem as RedeemIcon,
  DeiBonds as DeiBondsIcon,
  // Analytics as AnalyticsIcon,
} from 'components/Icons'
import { Card } from 'components/Card'
import { ExternalLink } from 'components/Link'
import useDebounce from 'hooks/useDebounce'

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

  ${({ active }) =>
    active &&
    ` 
    background: -webkit-linear-gradient(1deg, #e29d52, #de4a7b 30%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
    pointer-events: none;
  `};
`

const LegacyWrapper = styled.div`
  color: ${({ theme }) => theme.white};
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

  const [showNewDot, setShowNewDot] = useState(localStorage.getItem('Redeem_is_new') === 'seen' ? false : true)
  const [clicked, setClicked] = useState(false)
  const debouncedClicked = useDebounce(clicked, 5000)

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
    localStorage.setItem('Redeem_is_new', 'seen')
    setClicked(true)
    sendEvent('click', { click_type: 'close_notification', click_action: 'Redeem_is_new' })
  }, [])
  useOnOutsideClick(ref, () => setIsOpen(false))

  return (
    <Container ref={ref}>
      <NavToggle onClick={() => toggle()} />
      {/* <Image src={BURGER_ICON} alt="burger-icon" onClick={() => toggle()} /> */}
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
              <div>Mint</div>
              <IconWrapper>
                <MintIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>

          <Link href="/redemption" passHref>
            <Row active={router.route === '/redemption'}>
              <div>Redeem {showNewDot && !debouncedClicked && <Image src={DOT_NEW} alt="dot-icon" />}</div>
              <IconWrapper>
                <RedeemIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>

          <Link href="/bond" passHref>
            <Row active={router.route === '/bond'}>
              <div>Bond</div>
              <IconWrapper>
                <DeiBondsIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>

          <Link href="/vest" passHref>
            <Row active={router.route.includes('/vest')}>
              <div>veDEUS</div>
              <IconWrapper>
                <VeDeusIcon size={20} />
              </IconWrapper>
            </Row>
          </Link>

          <ExternalLink href="https://docs.deus.finance/contracts/disclaimer">
            <Row onClick={() => toggle()}>
              <div>Terms</div>
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
          <Separator />

          <ExternalLink href="https://legacy.dei.finance/">
            <Row onClick={() => toggle()}>
              <LegacyWrapper>
                Legacy App
                <LinkIcon style={{ marginLeft: '4px' }} />
              </LegacyWrapper>
              <Image src={LEGACY_DEI_LOGO} width={'20px'} height={'15px'} alt={'dei-logo'} />
            </Row>
          </ExternalLink>
        </InlineModal>
      </div>
    </Container>
  )
}
