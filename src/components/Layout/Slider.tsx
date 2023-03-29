import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isMobileOnly as isMobile } from 'react-device-detect'

import { Z_INDEX } from 'theme'

import Web3Network from 'components/Web3Network'
import Web3Status from 'components/Web3Status'
import Menu from './Menu'
import NavLogo2 from './NavLogo2'
import { Row as RowWrapper, RowEnd, RowStart } from 'components/Row'
import Footer from 'components/Disclaimer'

import { IconWrapper, Link as LinkIconLogo, Bridge as BridgeIcon, ChevronLeft } from 'components/Icons'
import { ArrowUpRight, ChevronRight } from 'react-feather'
import { useDeiPrice, useDeusPrice } from 'state/dashboard/hooks'
import Column from 'components/Column'
import { ExternalLink } from 'components/Link'
import { formatUnits } from '@ethersproject/units'
import { LegacyDEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { formatDollarAmount } from 'utils/numbers'
import { useFirebirdPrice } from 'hooks/useFirebirdPrice'
import { LegacyDEI_Address, USDC_ADDRESS } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import useWeb3React from 'hooks/useWeb3'
import { useTokenBalance } from 'state/wallet/hooks'
import { ROUTES, DEI_MENU_ROUTES, PARTNERS_MENU_ROUTES, USEFUL_LINKS_MENU_ROUTES } from './constants'
import ImageWithFallback from 'components/ImageWithFallback'

const Wrapper = styled.div<{ isOpen?: boolean }>`
  transition: width 0.25s;
  gap: 5px;
  width: ${({ isOpen }) => (isOpen ? '336px' : '66px')};
  display: flex;
  flex-direction: column;
  z-index: ${Z_INDEX.fixed};
  background: ${({ theme }) => theme.bg0};
  border-right: 2px solid ${({ theme }) => theme.bg1};
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0px 1.25rem;
  `};
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display:none;
  `};
`

const DefaultWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  height: 62px;
  position: absolute;
  background: ${({ theme }) => theme.bg0};
  border-bottom: 2px solid ${({ theme }) => theme.bg1};
`

const MobileWrapper = styled(Wrapper)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`

const Routes = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  gap: 4px;
  padding: 0px 12px;
  margin-top: 24px;
  font-size: 16px;
  line-height: 20px;

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

const SimpleLinkWrapper = styled(RowWrapper)<{ active?: boolean; isOpen?: boolean }>`
  transition: width 0.25s;
  margin-bottom: 16px;
  border-radius: 8px;
  width: ${({ isOpen }) => (isOpen ? '312px' : '42px')};
  height: 42px;
  cursor: pointer;
  opacity: 1;
  padding: 12px;
  &:hover {
    background: ${({ theme }) => theme.bg1};
  }
  ${({ active }) =>
    active &&
    `background: #0D0D0D;
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

const NavLink = styled.div<{ active: boolean }>`
  font-size: 1rem;
  padding: 0.25rem 1rem;
  color: ${({ theme }) => theme.text1};
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${({ active }) => (active ? '600' : '400')};
  font-size: 16px;
  line-height: 20px;
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
  gap: 16px;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  width: 100%;
  margin: 0px 12px;
  padding: 16px;
`

const Price = styled(RowEnd)`
  font-family: 'Inter';
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
  font-size: 0.875rem;
  font-weight: medium;
`

const DeusPriceWrap = styled.div`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  font-family: 'Inter';
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
  font-family: 'Inter';
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
  transition: all 0.25s;
  white-space: nowrap;
  justify-content: space-between;
  align-items: center;
  margin-right: ${({ isInternal }) => (isInternal ? 'auto' : '0')};
  width: 100%;
`

const CustomLink = styled(ExternalLink)`
  text-decoration: none;
  color: #8f939c !important;
  &:hover {
    color: white !important;
  }
  font-size: 1rem;
  font-weight: medium;
  font-family: 'Inter';
`

const MenuHideButton = styled.button`
  margin-left: -36px;
  padding: 12px 0px;
  max-width: 25px;
  max-height: 40px;
  background: ${({ theme }) => theme.bg1};
  border-radius: 8px 0px 0px 8px;
`

const MenuOpenButton = styled.button`
  margin-left: -36px;
  padding: 12px 0px;
  max-width: 25px;
  max-height: 40px;
  background: ${({ theme }) => theme.bg1};
  border-radius: 0px 8px 8px 0px;
`

const SidebarContent = styled.div<{ isOpen: boolean }>`
  position: relative;
  overflow-y: scroll;
  height: 100%;
  min-width: ${({ isOpen }) => (isOpen ? '300px' : '62px')};
  width: '100%';
  top: 0px;
  left: 0px;
`

const SubMenuWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 16px 0px;
`

const SubMenuTitle = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'relative' : 'none')};
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.bg4};
  margin: 0px 16px;
  min-width: fit-content;
`

export default function Slider() {
  const { account } = useWeb3React()
  const router = useRouter()
  const theme = useTheme()

  const deiPrice = useDeiPrice()
  const deusPrice = useDeusPrice()
  const [isOpen, setOpen] = useState(true)

  const legacyDeiPrice = useFirebirdPrice({
    amount: '1000000000000000000',
    chainId: SupportedChainId.FANTOM.toString(),
    from: LegacyDEI_Address[SupportedChainId.FANTOM].toString(),
    to: USDC_ADDRESS[SupportedChainId.FANTOM].toString(),
    gasInclude: '1',
    saveGas: '0',
    slippage: '0.01',
  })

  const LegacyDeiBalance = useTokenBalance(account ?? undefined, LegacyDEI_TOKEN ?? undefined)
  const hasLegacyDei = !!Number(LegacyDeiBalance?.toSignificant(6))

  function getMobileContent() {
    return (
      <>
        <MobileWrapper>
          <NavLogo2 isOpen={false} />
          <Web3Network />
          <Web3Status />
          <Menu />
        </MobileWrapper>
      </>
    )
  }

  function getDefaultContent() {
    return (
      <Wrapper isOpen={isOpen}>
        <SidebarContent isOpen={isOpen}>
          <DefaultWrapper>
            <NavLogo2 isOpen={isOpen} />
            {!isOpen ? (
              <MenuHideButton onClick={() => setOpen((prev) => !prev)}>
                <IconWrapper>
                  <ChevronLeft color="#6F7074"></ChevronLeft>
                </IconWrapper>
              </MenuHideButton>
            ) : (
              <MenuOpenButton onClick={() => setOpen((prev) => !prev)}>
                <IconWrapper>
                  <ChevronRight color="#6F7074"></ChevronRight>
                </IconWrapper>
              </MenuOpenButton>
            )}
          </DefaultWrapper>
          <Column style={{ position: 'relative', top: '62px' }}>
            <Routes>
              {ROUTES.map((route, index) => (
                <SimpleLinkWrapper
                  key={route.id}
                  isOpen={isOpen}
                  className={`sidebar-link__route ${index + 1 === ROUTES.length && 'last'}`}
                  active={router.asPath === route.path}
                >
                  <Link href={route.path} passHref>
                    <MenuItemLinkContainer>
                      <IconWrapper disable={router.asPath !== route.path}>
                        <route.icon size={18} />
                      </IconWrapper>
                      <NavLinkContainer isOpen={isOpen} isInternal={true}>
                        <NavLink active={router.asPath === route.path}>{route.title}</NavLink>
                        {route.specialIcon && (
                          <ImageWithFallback
                            src={route.specialIcon}
                            width={88}
                            height={24}
                            alt={`${route.title}_logo`}
                          />
                        )}
                      </NavLinkContainer>
                    </MenuItemLinkContainer>
                  </Link>
                </SimpleLinkWrapper>
              ))}

              <SubMenuWrapper>
                <SubMenuTitle isOpen={isOpen}>DEI</SubMenuTitle>
                <Separator style={{ margin: 'auto' }} />
              </SubMenuWrapper>
              {DEI_MENU_ROUTES.map((route, index) => (
                <SimpleLinkWrapper
                  key={route.id}
                  isOpen={isOpen}
                  className={`sidebar-link__route ${index + 1 === DEI_MENU_ROUTES.length && 'last'}`}
                  active={router.asPath === route.path}
                >
                  <Link href={route.path} passHref>
                    <MenuItemLinkContainer>
                      <IconWrapper disable={router.asPath !== route.path}>
                        <route.icon size={18} />
                      </IconWrapper>
                      <NavLinkContainer isOpen={isOpen} isInternal={true}>
                        <NavLink active={router.asPath === route.path}>{route.title}</NavLink>
                      </NavLinkContainer>
                    </MenuItemLinkContainer>
                  </Link>
                </SimpleLinkWrapper>
              ))}

              <SubMenuWrapper>
                <SubMenuTitle isOpen={isOpen}>Partners</SubMenuTitle>
                <Separator style={{ margin: 'auto' }} />
              </SubMenuWrapper>
              {PARTNERS_MENU_ROUTES.map((route, index) => (
                <SimpleLinkWrapper
                  key={route.id}
                  isOpen={isOpen}
                  className={`sidebar-link__route ${index + 1 === PARTNERS_MENU_ROUTES.length && 'last'}`}
                  active={router.asPath === route.path}
                >
                  <Link href={route.path} passHref>
                    <MenuItemLinkContainer>
                      <IconWrapper disable={router.asPath !== route.path}>
                        <route.icon size={18} />
                      </IconWrapper>
                      <NavLinkContainer isOpen={isOpen} isInternal={true}>
                        <NavLink active={router.asPath === route.path}>{route.title}</NavLink>
                      </NavLinkContainer>
                    </MenuItemLinkContainer>
                  </Link>
                </SimpleLinkWrapper>
              ))}

              <SubMenuWrapper>
                <SubMenuTitle isOpen={isOpen}>Useful Links</SubMenuTitle>
                <Separator style={{ margin: 'auto' }} />
              </SubMenuWrapper>
              {USEFUL_LINKS_MENU_ROUTES.map((route, index) => (
                <SimpleLinkWrapper
                  key={route.id}
                  isOpen={isOpen}
                  className={`sidebar-link__route ${index + 1 === USEFUL_LINKS_MENU_ROUTES.length && 'last'}`}
                >
                  <ExternalLink href={route.path} passHref style={{ width: '100%' }}>
                    <MenuItemLinkContainer>
                      <IconWrapper disable={router.asPath !== route.path}>
                        <route.icon size={18} />
                      </IconWrapper>
                      <NavLinkContainer isOpen={isOpen} isInternal={false}>
                        <NavLink active={false}>
                          {route.title}
                          <LinkIconLogo size={8} style={{ marginLeft: '8px' }} />
                        </NavLink>
                        {route.specialIcon && (
                          <ImageWithFallback
                            src={route.specialIcon}
                            width={88}
                            height={24}
                            alt={`${route.title}_logo`}
                          />
                        )}
                      </NavLinkContainer>
                    </MenuItemLinkContainer>
                  </ExternalLink>
                </SimpleLinkWrapper>
              ))}
            </Routes>

            <NavLinkContainer isOpen={isOpen} style={{ cursor: 'default', flexDirection: 'column', padding: '12px' }}>
              {isOpen && <Separator />}
              <PricesWrap style={{ cursor: 'default' }}>
                <Token>
                  DEI Price
                  <Price>
                    <DeiPriceWrap>{formatDollarAmount(parseFloat(deiPrice), 3)}</DeiPriceWrap>
                  </Price>
                </Token>
                <Token>
                  DEUS Price
                  <Price>
                    <DeusPriceWrap>{formatDollarAmount(parseFloat(deusPrice), 2)}</DeusPriceWrap>
                  </Price>
                </Token>
                {hasLegacyDei && legacyDeiPrice && (
                  <Token>
                    Legacy DEI Price
                    <Price>
                      <LegacyDeiPriceWrap>
                        ${(+formatUnits(legacyDeiPrice, USDC_TOKEN.decimals))?.toFixed(3)}
                      </LegacyDeiPriceWrap>
                    </Price>
                  </Token>
                )}
              </PricesWrap>
            </NavLinkContainer>
          </Column>

          <NavLinkContainer isOpen={isOpen} style={{ flexDirection: 'column', padding: '12px' }}>
            <Column style={{ width: '100%' }}>
              {isOpen && <Separator />}
              <Data>
                <CustomLink href={'https://docs.deus.finance'} passHref>
                  <DataItems>
                    Bug Bounty
                    <LinkIconLogo size={8} style={{ marginLeft: '8px', marginTop: '4px' }} color={theme.bg4} />
                  </DataItems>
                </CustomLink>
                <CustomLink href={'https://docs.deus.finance'} passHref>
                  <DataItems>
                    Docs
                    <LinkIconLogo size={8} style={{ marginLeft: '8px', marginTop: '4px' }} color={theme.bg4} />
                  </DataItems>
                </CustomLink>
                <CustomLink href={'https://docs.deus.finance/contracts/disclaimer'} passHref>
                  <DataItems>
                    Terms
                    <LinkIconLogo size={8} style={{ marginLeft: '8px', marginTop: '4px' }} color={theme.bg4} />
                  </DataItems>
                </CustomLink>
              </Data>

              <Separator style={{ marginBlock: '32px', height: 1, padding: '0px 24px' }} />

              <Column style={{ width: '100%' }}>
                <Footer isOpen={isOpen} />
              </Column>
            </Column>
          </NavLinkContainer>
        </SidebarContent>
      </Wrapper>
    )
  }

  return isMobile ? getMobileContent() : getDefaultContent()
}
