import React, { useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isMobileOnly as isMobile } from 'react-device-detect'

import routes from './routes.json'

import { Z_INDEX } from 'theme'
import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import { sendEvent } from 'components/analytics'
import RiskNotification from 'components/InfoHeader'
import Menu from './Menu'
import NavLogo from './NavLogo'

const Wrapper = styled.div`
  padding: 0px 2rem;
  height: 55px;
  align-items: center;
  background: ${({ theme }) => theme.bg0};
  gap: 5px;
  z-index: ${Z_INDEX.fixed};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 1.25rem;
  `};
`

const DefaultWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
  font-family: 'Inter';
  font-size: 16px;
  line-height: 19px;
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
  flex-flow: row nowrap;
  justify-content: center;
  gap: 4px;

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

const SimpleLinkWrapper = styled.div`
  margin-top: 6px;
`

const Items = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      gap: 5px;
  `};
`

const NavLink = styled.div<{
  active: boolean
}>`
  font-size: 1rem;
  padding: 0.25rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  ${({ active }) =>
    active &&
    `
    background: -webkit-linear-gradient(1deg, #e29d52 -10.26%, #de4a7b 90%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
`};

  &:hover {
    cursor: default;
    ${({ active, theme }) =>
      !active &&
      `
      cursor: pointer;
      color: ${theme.darkPink};
  `};
  }
`

export default function NavBar() {
  const router = useRouter()

  const showBanner = localStorage.getItem('risk_warning') === 'true' ? false : true
  const [showTopBanner, setShowTopBanner] = useState(showBanner)
  const bannerText = 'Users interacting with this software do so entirely at their own risk'

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
          <NavLogo />
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
      <>
        <DefaultWrapper>
          <NavLogo />
          <Routes>
            {routes.map((item, i) => {
              return (
                <SimpleLinkWrapper key={i}>
                  <Link href={item.path} passHref>
                    <NavLink active={router.route === item.path}>{item.text}</NavLink>
                  </Link>
                </SimpleLinkWrapper>
              )
            })}
          </Routes>
          <Items>
            <Web3Network />
            <Web3Status />
            <Menu />
          </Items>
        </DefaultWrapper>
        {showTopBanner && <RiskNotification onClose={setShowBanner} bg={'gray'} hasInfoIcon={true} text={bannerText} />}
      </>
    )
  }

  return isMobile ? getMobileContent() : getDefaultContent()
}
