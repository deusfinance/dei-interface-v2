import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isMobileOnly as isMobile } from 'react-device-detect'

import { Z_INDEX } from 'theme'
import routes from 'constants/routes.json'

import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import Menu from './Menu'
import NavLogo from './NavLogo'
import { ChevronDown } from 'components/Icons'

const Wrapper = styled.div`
  padding: 0px 2rem;
  height: 55px;
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  gap: 5px;
  z-index: ${Z_INDEX.fixed};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 1.25rem;
  `};
`

const DefaultWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
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
  gap: 15px;

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
  margin-top: -10px;
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
  gap: 5px;
`

const NavLink = styled.div<{
  active: boolean
}>`
  font-size: 1rem;
  padding: 0.25rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  ${({ active, theme }) =>
    active &&
    `
    // pointer-events: none;
    // border-radius: 6px;
    // background-color: ${theme.warning};
    font-weight: 900;
    color: ${theme.warning};
`};

  &:hover {
    cursor: default;
    ${({ active, theme }) =>
      !active &&
      `
      cursor: pointer;
      color: ${theme.warning};
  `};
  }
`

const TitleSpan = styled.span<{ active: boolean }>`
  ${({ active, theme }) =>
    active &&
    `
    // background-color: ${theme.warning};
    // padding: 5px 7px;
    // border-radius: 6px;
    font-weight: 900;
    color: ${theme.warning};
`};
`

export default function NavBar() {
  const router = useRouter()

  function getMobileContent() {
    return (
      <MobileWrapper>
        <NavLogo />
        <Web3Status />
        <Menu />
      </MobileWrapper>
    )
  }

  function isSubItemChosen(item: Array<any>) {
    for (let i = 0; i < item.length; i++) {
      if (item[i].path === router.route) return true
    }
    return false
  }

  function getDefaultContent() {
    return (
      <DefaultWrapper>
        <NavLogo />
        <Routes>
          {routes.map((item) => {
            return item.children ? (
              <NavbarContentWrap key={item.id}>
                <TitleSpan active={isSubItemChosen(item.children)}>
                  {item.text}
                  <ChevronDown
                    color={isSubItemChosen(item.children) ? '#FF8F00' : 'white'}
                    disable
                    style={{ position: 'absolute' }}
                  />
                </TitleSpan>
                <SubNavbarContentWrap>
                  {item.children.map((subItem) => (
                    <li key={subItem.id}>
                      <Link href={subItem.path} passHref>
                        <NavLink active={router.route === subItem.path}>{subItem.text}</NavLink>
                      </Link>
                    </li>
                  ))}
                </SubNavbarContentWrap>
              </NavbarContentWrap>
            ) : (
              <SimpleLinkWrapper key={item.id}>
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
    )
  }

  return isMobile ? getMobileContent() : getDefaultContent()
}
