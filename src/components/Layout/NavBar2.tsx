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

const Wrapper = styled.div`
  gap: 5px;
  width: 336px;
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
  flex-flow: column nowrap;
  font-family: 'Inter';
  font-size: 16px;
  line-height: 19px;
  height: 62px;
  /* width: 336px; */
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
}>`
  margin-bottom: 16px;
  border-radius: 8px;
  width: 312px;
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
`

const Items = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      gap: 5px;
  `};
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
    ` color: ${theme.darkPink};
      pointer-events: none;
  `};
`

const NavLink = styled.div<{
  active: boolean
}>`
  font-size: 1rem;
  padding: 0.25rem 1rem;
  /* text-align: center; */
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
`

const Separator = styled.div`
  width: 100%;
  height: 2px;
  margin: 28px 0px;
  background: ${({ theme }) => theme.bg3};
`

const Logo = styled(RowEnd)`
  width: 50%;
`

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
  & > * {
    margin: 8px 0px;
  }
`

const DataItems = styled(RowStart)`
  margin: 8px 0px;
`
const CustomLink = styled(ExternalLink)`
  text-decoration: none;
  color: #8f939c !important;
`
export default function NavBar() {
  const router = useRouter()

  const showBanner = localStorage.getItem('risk_warning') === 'true' ? false : true
  const [showTopBanner, setShowTopBanner] = useState(showBanner)
  const bannerText = 'Users interacting with this software do so entirely at their own risk'
  const DeiPrice = useDeiPrice()
  const DeusPrice = useDeusPrice()

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

  function getDefaultContent() {
    return (
      <Wrapper>
        <Column>
          <DefaultWrapper>
            <NavLogo2 />

            {/* <Items>
            <Web3Network />
            <Web3Status />
            <Menu />
          </Items> */}
          </DefaultWrapper>
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
            <SimpleLinkWrapper className="sidebar-link__route" active={router.route.includes('/dashboard')}>
              <IconWrapper>
                <DashboardIcon size={20} />
              </IconWrapper>
              <Link href="/dashboard" passHref>
                <NavLink active={router.route.includes('/dashboard')}>Dashboard</NavLink>
              </Link>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper className="sidebar-link__route" active={router.route.includes('/mint')}>
              <IconWrapper>
                <MintIcon size={20} />
              </IconWrapper>
              <Link href="/mint" passHref>
                <NavLink active={router.route.includes('/mint')}>Mint DEI</NavLink>
              </Link>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper className="sidebar-link__route" active={router.route.includes('/redemption')}>
              <IconWrapper>
                <RedeemIcon size={20} />
              </IconWrapper>
              <Link href="/redemption" passHref>
                <NavLink active={router.route.includes('/redemption')}>Redeem DEI</NavLink>
              </Link>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper className="sidebar-link__route" active={router.route.includes('/stake')}>
              <IconWrapper>
                <DeiBondsIcon size={20} />
              </IconWrapper>
              <Link href="/stake" passHref>
                <NavLink active={router.route.includes('/stake')}>Pools</NavLink>
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
            <SimpleLinkWrapper className="sidebar-link__route last" active={router.route.includes('/swap')}>
              <IconWrapper>
                <SwapIcon width={20} color={'#EBEBEC'} />
              </IconWrapper>
              <Link href="/swap" passHref>
                <NavLink active={router.route.includes('/swap')}>Swap</NavLink>
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

            <SimpleLinkWrapper className="last">
              <IconWrapper>
                <VeDeusIcon size={20} />
              </IconWrapper>
              <ExternalLink style={{ fontSize: 20, padding: '0.25rem 1rem' }} href="https://app.deus.finance/clqdr">
                xDEUS
              </ExternalLink>
              <ArrowUpRight />
              <Logo>
                <ImageWithFallback src={DEUSFINANCE} width={92} height={14} alt={`deus_finance_logo`} />
              </Logo>
            </SimpleLinkWrapper>
            <SimpleLinkWrapper>
              <IconWrapper>
                <BridgeIcon size={20} />
              </IconWrapper>
              <ExternalLink
                style={{ fontSize: 20, padding: '0.25rem 1rem' }}
                href="https://app.multichain.org/#/router"
              >
                Bridge
              </ExternalLink>
              <ArrowUpRight />
              <Logo>
                <ImageWithFallback src={MULTICHAIN} width={88} height={13} alt={`multichain_logo`} />
              </Logo>
            </SimpleLinkWrapper>
          </Routes>
          <Separator />
          <PricesWrap>
            <Token>
              DEI Price
              <Price>
                <DeiPriceWrap>${DeiPrice}</DeiPriceWrap>
              </Price>
            </Token>
            <Token>
              DEUS Price
              <Price>
                <DeusPriceWrap>${DeusPrice}</DeusPriceWrap>
              </Price>
            </Token>
            <Token>
              Legacy DEI Price:
              <Price>
                <LegacyDeiPriceWrap>${DeusPrice}</LegacyDeiPriceWrap>
              </Price>
            </Token>
          </PricesWrap>
          <Separator />
        </Column>

        <Column>
          <Data>
            <CustomLink href={'https://docs.deus.finance'} passHref>
              <DataItems>
                Bug Bounty
                <ArrowUpRight />
              </DataItems>
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

          <Separator />

          <Footer />
        </Column>

        {showTopBanner && <RiskNotification onClose={setShowBanner} bg={'gray'} hasInfoIcon={true} text={bannerText} />}
      </Wrapper>
    )
  }

  return isMobile ? getMobileContent() : getDefaultContent()
}
