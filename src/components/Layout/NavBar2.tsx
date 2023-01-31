import React, { useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isMobileOnly as isMobile } from 'react-device-detect'

// import routes from 'constants/files/routes.json'
import MULTICHAIN from '/public/static/images/pages/dashboard/ic_multichain.svg'
import DEUSFINANCE from '/public/static/images/pages/dashboard/ic_deus_finance.svg'
import ImageWithFallback from 'components/ImageWithFallback'

import { Z_INDEX } from 'theme'

import { sendEvent } from 'components/analytics'
import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import RiskNotification from 'components/InfoHeader'
import Menu from './Menu'
import NavLogo2 from './NavLogo2'
import { Row as RowWrapper, RowEnd, RowStart } from 'components/Row'
import Footer from 'components/Disclaimer'

import {
  IconWrapper,
  Dashboard as DashboardIcon,
  VeDeus as VeDeusIcon,
  Mint as MintIcon,
  Redeem as RedeemIcon,
  DeiBonds as DeiBondsIcon,
  Bridge as BridgeIcon,
  Swap as SwapIcon,
  // Analytics as AnalyticsIcon,
} from 'components/Icons'
import { ArrowUpRight } from 'react-feather'
import { useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'
import Column from 'components/Column'
import { ExternalLink } from 'components/Link'
import { formatUnits } from '@ethersproject/units'
import { USDC_TOKEN } from 'constants/tokens'
import { formatDollarAmount } from 'utils/numbers'
import { useFirebirdPrice } from 'hooks/useFirebirdPrice'
import { SolidAddress, USDC_ADDRESS } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'

const Wrapper = styled.div<{ isOpen?: boolean }>`
  transition: width 0.15s;
  gap: 5px;
  width: ${({ isOpen }) => (isOpen ? '336px' : '74px')};
  display: flex;
  flex-direction: column;
  z-index: ${Z_INDEX.fixed};
  background: ${({ theme }) => theme.bg0};
  border-right: 2px solid ${({ theme }) => theme.bg3};
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 1.25rem;
  `};
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display:none;
  `};
`

const DefaultWrapper = styled(Wrapper)`
  display: flex;
  justify-content: flex-start !important;
  flex-direction: row;
  align-items: center;
  font-family: 'Inter';
  font-size: 16px;
  line-height: 19px;
  height: 62px;
  position: absolute;
  top: 0px;
  background: ${({ theme }) => theme.bg0};

  border-bottom: 2px solid ${({ theme }) => theme.bg3};

  & > * {
    &:first-child {
      flex: 1;
    }
    &:last-child {
      flex: 1;
    }
  }
`

const MobileWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`

const Routes = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  gap: 4px;
  padding: 0px 12px;
  margin-top: 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      &:nth-child(2) {
        display: none;
      }
    }
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    & > * {
      &:nth-child(1),
      &:nth-child(3),
      &:nth-child(4)
     {
        display: none;
      }
    }
  `};
`

export const NavbarContentWrap = styled.div`
  list-style: none;
  margin: auto;
  margin-left: 15px;
  margin-right: 15px;
  cursor: pointer;
  padding: 10px 0;
  position: relative;

  &:hover {
    display: block;
    & > ul {
      display: block;
    }
  }
`

export const SubNavbarContentWrap = styled.ul`
  display: none;
  padding: 12px 0 12px 0px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 10px;
  list-style: none;
  position: absolute;
  top: 50px;
  margin-top: -14px;
  left: 50%;
  transform: translateX(-50%);

  & > li > div {
    border-radius: 0;
    padding: 0.45rem 1rem;
    min-width: 150px;
  }
`

const SimpleLinkWrapper = styled(RowWrapper)<{
  active?: boolean
  isOpen?: boolean
}>`
  transition: width 0.15s;
  margin-bottom: 16px;
  border-radius: 8px;
  width: ${({ isOpen }) => (isOpen ? '312px' : '50px')};
  height: 42px;
  cursor: pointer;
  opacity: 1;
  padding: 12px 16px;
  &:hover {
    background: ${({ theme }) => theme.bg1};
  }
  ${({ active, theme }) =>
    active &&
    `background: ${theme.bg1};
    font-weight: 600;
`};
  &.last {
    margin-bottom: 0px;
  }
  overflow: hidden;
`

const Row = styled.div<{
  active?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.text2};
  ${({ active, theme }) =>
    active &&
    ` color: ${theme.darkPink};
      pointer-events: none;
  `};
`

const NavLink = styled.div<{
  active: boolean
}>`
  font-size: 1rem;
  padding: 0.25rem 1rem;
  color: ${({ theme }) => theme.text1};

  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 26px;
  cursor: pointer;

  /* ${({ active }) =>
    active &&
    `
  background: -webkit-linear-gradient(1deg, #e29d52 -10.26%, #de4a7b 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  `}; */
`

const PricesWrap = styled(Row)`
  flex-direction: column;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  width: 288px;
  padding: 20px 12px;
  margin: 0 auto;
`

const Price = styled(RowEnd)`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
`

const DeiPriceWrap = styled.div`
  background: ${({ theme }) => theme.deiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  font-size: 0.875rem;
  font-weight: medium;
`

const DeusPriceWrap = styled.div`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  font-size: 0.875rem;
  font-weight: medium;
`
const LegacyDeiPriceWrap = styled.div`
  background: ${({ theme }) => theme.deiLegacyColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.875rem;
  font-weight: medium;
`

const Token = styled.div`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  display: flex;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  justify-content: space-between;
  width: 100%;
`

const Separator = styled.div`
  width: 100%;
  height: 2px;
  margin: 28px 0px;
  background: ${({ theme }) => theme.bg3};
`

const Logo = styled(RowEnd)``

const Data = styled.div`
  margin-top: 70px;
  padding: 28px;
  padding-bottom: 0px;
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 21px;
  color: ${({ theme }) => theme.bg6};
`

const DataItems = styled(RowStart)`
  margin: 16px 0px 0px 0px;
  & > svg {
    margin-left: 8px;
  }
`
const MenuItemLinkContainer = styled(Row)`
  align-items: center;
  width: 100%;
`
const NavLinkContainer = styled(Row)<{ isOpen: boolean; isInternal?: boolean }>`
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  z-index: ${({ isOpen }) => (isOpen ? 1 : -1)};
  transform: ${({ isOpen }) => (isOpen ? 'scale(1)' : 'scale(0)')};
  transform-origin: left;
  transition: all 0.15s;
  white-space: nowrap;
  justify-content: flex-start;
  align-items: center;
  margin-right: ${({ isInternal }) => (isInternal ? 'auto' : '0')}; ;
`
const BurgerMenuButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: center;
  max-width: 75px !important;
  position: relative;
  span {
    transition: all 0.15s;
    margin-inline: auto;
    width: 20px;
    height: 2px;
    background-color: white;
    display: inline-block;
    margin-block: 3px;
    ${({ isOpen }) =>
      isOpen &&
      `
      position:absolute;
      left:50%;
      &:first-of-type{
        transform:translateX(-50%) rotate(45deg);
        margin-block: 0px;
      }
      &:last-of-type{
        transform:translateX(-50%) rotate(-45deg);
        margin-block: 0px;
      }
      &:nth-of-type(2){
        opacity:0;
        position:absolute;
        left:50%;
        transform:translate(-50%);
      }

    `}
  }
`

const CustomLink = styled(ExternalLink)`
  text-decoration: none;
  color: #8f939c !important;
  &:hover {
    color: white !important;
  }
  font-size: 1rem;
  font-weight: medium;
  font-family: 'IBM Plex Mono';
`
export default function NavBar() {
  const router = useRouter()

  const showBanner = localStorage.getItem('risk_warning') === 'true' ? false : true
  const [showTopBanner, setShowTopBanner] = useState(showBanner)
  const bannerText = 'Users interacting with this software do so entirely at their own risk'
  const DeiPrice = useDeiPrice()
  const DeusPrice = useDeusPrice()
  const [isOpen, setOpen] = useState(true)

  const LegacyDeiPrice = useFirebirdPrice({
    amount: '1000000000000000000',
    chainId: SupportedChainId.FANTOM.toString(),
    from: SolidAddress[SupportedChainId.FANTOM].toString(),
    to: USDC_ADDRESS[SupportedChainId.FANTOM].toString(),
    gasInclude: '1',
    saveGas: '0',
    slippage: '0.01',
  })

  function setShowBanner(inp: boolean) {
    if (!inp) {
      localStorage.setItem('risk_warning', 'true')
      setShowTopBanner(false)
      sendEvent('click', { click_type: 'close_notification', click_action: 'risk_warning' })
    }
  }

  function getMobileContent() {
    return (
      <>
        <MobileWrapper>
          <NavLogo2 />
          <Web3Network />
          <Web3Status />
          <Menu />
        </MobileWrapper>
        {showTopBanner && <RiskNotification onClose={setShowBanner} bg={'gray'} hasInfoIcon={true} text={bannerText} />}
      </>
    )
  }

  // function isSubItemChosen(item: Array<any>) {
  //   for (let i = 0; i < item.length; i++) {
  //     if (item[i].path === router.route) return true
  //   }
  //   return false
  // }

  // <Link passHref href="/">
  //   <ImageWithFallback alt="dei-logo" src={DEUSLOGO} width={40} height={40} />
  // </Link>
  function getDefaultContent() {
    return (
      <Wrapper isOpen={isOpen}>
        <DefaultWrapper isOpen={true}>
          <BurgerMenuButton isOpen={isOpen} onClick={() => setOpen((prev) => !prev)}>
            <span />
            <span />
            <span />
          </BurgerMenuButton>
          <NavLogo2 />
        </DefaultWrapper>
        <Column style={{ position: 'relative', top: '62px' }}>
          {/* <Items>
            <Web3Network />
            <Web3Status />
            <Menu />
          </Items> */}
          <Routes>
            {/* {routes.map((item, i) => {
            return (
              <SimpleLinkWrapper key={i} active={router.route.includes(item.path)}>
                <IconWrapper>
                  <DashboardIcon size={20} />
                </IconWrapper>
                <Link href={item.path} passHref>
                  <NavLink active={router.route.includes(item.path)}>{item.text}</NavLink>
                </Link>
              </SimpleLinkWrapper>
            )
          })} */}
            <SimpleLinkWrapper
              isOpen={isOpen}
              className="sidebar-link__route"
              active={router.route.includes('/dashboard')}
            >
              <Link href="/dashboard" passHref>
                <MenuItemLinkContainer>
                  <IconWrapper>
                    <DashboardIcon size={20} />
                  </IconWrapper>
                  <NavLinkContainer isOpen={isOpen} isInternal={true}>
                    <NavLink active={router.route.includes('/dashboard')}>Dashboard</NavLink>
                  </NavLinkContainer>
                </MenuItemLinkContainer>
              </Link>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper isOpen={isOpen} className="sidebar-link__route" active={router.route.includes('/mint')}>
              <Link href="/mint" passHref>
                <MenuItemLinkContainer>
                  <IconWrapper>
                    <MintIcon size={20} />
                  </IconWrapper>
                  <NavLinkContainer isOpen={isOpen} isInternal={true}>
                    <NavLink active={router.route.includes('/mint')}>Mint DEI</NavLink>
                  </NavLinkContainer>
                </MenuItemLinkContainer>
              </Link>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper
              isOpen={isOpen}
              className="sidebar-link__route"
              active={router.route.includes('/redemption')}
            >
              <Link href="/redemption" passHref>
                <MenuItemLinkContainer>
                  <IconWrapper>
                    <RedeemIcon size={20} />
                  </IconWrapper>
                  <NavLinkContainer isOpen={isOpen} isInternal={true}>
                    <NavLink active={router.route.includes('/redemption')}>Redeem DEI</NavLink>
                  </NavLinkContainer>
                </MenuItemLinkContainer>
              </Link>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper isOpen={isOpen} className="sidebar-link__route" active={router.route.includes('/stake')}>
              <Link href="/stake" passHref>
                <MenuItemLinkContainer>
                  <IconWrapper>
                    <DeiBondsIcon size={20} />
                  </IconWrapper>
                  <NavLinkContainer isOpen={isOpen} isInternal={true}>
                    <NavLink active={router.route.includes('/stake')}>Pools</NavLink>
                  </NavLinkContainer>
                </MenuItemLinkContainer>
              </Link>
            </SimpleLinkWrapper>
            {/* <SimpleLinkWrapper className="sidebar-link__route" active={router.route.includes('/vest')}>
                <IconWrapper>
                  <VeDeusIcon size={20} />
                </IconWrapper>
                <Link href="/vest" passHref>
                  <NavLink active={router.route.includes('/vest')}>veDEUS</NavLink>
                </Link>
              </SimpleLinkWrapper> */}
            <SimpleLinkWrapper
              isOpen={isOpen}
              className="sidebar-link__route last"
              active={router.route.includes('/swap')}
            >
              <Link href="/swap" passHref>
                <MenuItemLinkContainer>
                  <IconWrapper>
                    <SwapIcon width={20} color={'#EBEBEC'} />
                  </IconWrapper>
                  <NavLinkContainer isOpen={isOpen} isInternal={true}>
                    <NavLink active={router.route.includes('/swap')}>Swap</NavLink>
                  </NavLinkContainer>
                </MenuItemLinkContainer>
              </Link>
            </SimpleLinkWrapper>
            {/* <SimpleLinkWrapper active={router.route.includes('/clqdr')}>
            <Link href="/clqdr" passHref>
              <NavLink active={router.route.includes('/clqdr')}>cLQDR</NavLink>
            </Link>
          </SimpleLinkWrapper>
          <SimpleLinkWrapper>
            <Link href={'https://docs.deus.finance/contracts/disclaimer'} passHref>
              <a style={{ textDecoration: 'none' }} rel="noreferrer" target="_blank">
                <NavLink active={false}>Terms</NavLink>
              </a>
            </Link>
          </SimpleLinkWrapper> */}

            <Separator />

            <SimpleLinkWrapper isOpen={isOpen} className="last" as={ExternalLink} href="https://app.deus.finance/clqdr">
              <MenuItemLinkContainer>
                <Row>
                  <IconWrapper>
                    <VeDeusIcon size={20} />
                  </IconWrapper>
                  <ExternalLink style={{ fontSize: 20, padding: '0.25rem 1rem' }} href="https://app.deus.finance/clqdr">
                    xDEUS
                  </ExternalLink>
                </Row>

                <NavLinkContainer isOpen={isOpen}>
                  <ArrowUpRight />
                  <Logo>
                    <ImageWithFallback src={DEUSFINANCE} width={92} height={14} alt={`deus_finance_logo`} />
                  </Logo>
                </NavLinkContainer>
              </MenuItemLinkContainer>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper as={ExternalLink} href="https://app.multichain.org/#/router" isOpen={isOpen}>
              <MenuItemLinkContainer>
                <Row>
                  <IconWrapper>
                    <BridgeIcon size={20} />
                  </IconWrapper>
                  <ExternalLink
                    style={{ fontSize: 20, padding: '0.25rem 1rem' }}
                    href="https://app.multichain.org/#/router"
                  >
                    Bridge
                  </ExternalLink>
                </Row>
                <NavLinkContainer isOpen={isOpen}>
                  <ArrowUpRight />
                  <Logo>
                    <ImageWithFallback src={MULTICHAIN} width={88} height={13} alt={`multichain_logo`} />
                  </Logo>
                </NavLinkContainer>
              </MenuItemLinkContainer>
            </SimpleLinkWrapper>
          </Routes>
          {isOpen && <Separator />}
          <NavLinkContainer isOpen={isOpen} style={{ cursor: 'default' }}>
            <PricesWrap style={{ cursor: 'default' }}>
              <Token>
                DEI Price
                <Price>
                  <DeiPriceWrap>{formatDollarAmount(parseFloat(DeiPrice), 3)}</DeiPriceWrap>
                </Price>
              </Token>
              <Token>
                DEUS Price
                <Price>
                  <DeusPriceWrap>{formatDollarAmount(parseFloat(DeusPrice), 2)}</DeusPriceWrap>
                </Price>
              </Token>
              {LegacyDeiPrice && (
                <Token>
                  Legacy DEI Price:
                  <Price>
                    <LegacyDeiPriceWrap>
                      ${(+formatUnits(LegacyDeiPrice, USDC_TOKEN.decimals))?.toFixed(3)}
                    </LegacyDeiPriceWrap>
                  </Price>
                </Token>
              )}
            </PricesWrap>
          </NavLinkContainer>
          <Separator />
        </Column>

        <NavLinkContainer isOpen={isOpen}>
          <Column style={{ width: '100%' }}>
            <Data>
              <CustomLink href={'https://docs.deus.finance'} passHref>
                <DataItems>Bug Bounty</DataItems>
              </CustomLink>

              <CustomLink href={'https://docs.deus.finance'} passHref>
                <DataItems>
                  Docs
                  <ArrowUpRight />
                </DataItems>
              </CustomLink>
              <CustomLink href={'https://docs.deus.finance/contracts/disclaimer'} passHref>
                <DataItems>
                  Terms
                  <ArrowUpRight />
                </DataItems>
              </CustomLink>
            </Data>

            <Separator style={{ marginBlock: '32px', height: 1 }} />

            <div style={{ width: '100%' }}>
              {' '}
              <Footer />
            </div>
          </Column>
        </NavLinkContainer>
        {showTopBanner && <RiskNotification onClose={setShowBanner} bg={'gray'} hasInfoIcon={true} text={bannerText} />}
      </Wrapper>
    )
  }

  return isMobile ? getMobileContent() : getDefaultContent()
}
