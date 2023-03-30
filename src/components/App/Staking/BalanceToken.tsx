import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import Link from 'next/link'

import { useDeiPrice, useDeusPrice } from 'state/dashboard/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { LiquidityType } from 'constants/stakingPools'

import useWeb3React from 'hooks/useWeb3'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { usePoolBalances } from 'hooks/useStablePoolInfo'

import Container from './common/Container'
import { Divider, HStack } from './common/Layout'
import ImageWithFallback from 'components/ImageWithFallback'
import { ChevronDown } from 'components/Icons'
import { ExternalLink } from 'components/Link'

const Wrapper = styled(HStack)`
  justify-content: space-between;
  padding: 12px;
`
const BalanceHeader = styled(Wrapper)`
  background: ${({ theme }) => theme.bg1};
  &:first-of-type {
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
  }
`

const IconContainer = styled.div`
  border-radius: 100px;
  background: ${({ theme }) => theme.bg0};
  position: relative;
  border: 2px solid;
  border-color: ${({ theme }) => theme.bg5};
  margin-right: 8px;
  padding: 4px;
`
const Icon = styled(ImageWithFallback)`
  width: 12px;
  height: 12px;
`
const HeaderTextLabel = styled.p`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 0.875rem;
  font-weight: medium;
`
const HeaderTextValue = styled(HStack)`
  & > p:first-of-type {
    color: #fff;
  }
  & > p:last-of-type {
    color: ${({ theme }) => theme.text2};
    margin-left: 6px;
  }
  font-size: 0.875rem;
  font-weight: medium;
`
interface IDropdown {
  isOpen: boolean
}
const DropDownContainer = styled(Wrapper)<IDropdown>`
  background: ${({ theme }) => theme.bg1};
  border-bottom-right-radius: ${({ isOpen }) => (!isOpen ? '12px' : '0px')};
  border-bottom-left-radius: ${({ isOpen }) => (!isOpen ? '12px' : '0px')};
  & > p:first-of-type {
    font-size: 0.75rem;
    font-weight: 600;
    color: #ebebec;
  }
  cursor: pointer;
`
const DropDownContent = styled(Wrapper)<IDropdown>`
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  background: ${({ theme }) => theme.bg1};
  padding: 12px;
  row-gap: 12px;
`
const DropDownContentOption = styled(HStack)`
  justify-content: space-between;
  width: 100%;
  & > p {
    &:first-of-type {
      font-size: 0.75rem;
      font-weight: normal;
      color: ${({ theme }) => theme.text2};
    }
  }
  &:first-of-type {
    & > a {
      display: flex;
      align-items: center;
      column-gap: 4px;
      background: -webkit-linear-gradient(left, #f78c2a, #f34038);
      border-image: -webkit-linear-gradient(left, #f78c2a, #f34038) 1;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  &:last-of-type {
    & > a {
      background: -webkit-linear-gradient(left, #e0974c, #c93f6f);
      border-image: -webkit-linear-gradient(left, #e0974c, #c93f6f) 1;
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
    }
  }
  & > a {
    font-size: 0.75rem;
    font-weight: 600;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    border-bottom: 1px solid;
  }
`
const StyledChevron = styled(({ isOpen, ...props }) => <ChevronDown {...props} />)<{
  isOpen?: boolean
}>`
  transition: transform 0.5s ease-out;
  size: 2rem;
  ${(props) =>
    props.isOpen &&
    css`
      transform: scaleY(-1);
    `};
`
interface ICustomLink {
  href: string
  children: React.ReactChild
}
const CustomLink = ({ href, children }: ICustomLink) => {
  const isExternal = !href.startsWith('/')
  if (isExternal) {
    return <ExternalLink href={href}>{children}</ExternalLink>
  }
  return <Link href={href}>{children}</Link>
}
const BalanceToken = ({ pool }: { pool: LiquidityType }) => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const { account } = useWeb3React()

  const { tokens } = pool
  const tokensAddress = tokens.map((token) => token.address)
  const tokensLogo = useCurrencyLogos(tokensAddress)

  const deusPrice = useDeusPrice()
  const deiPrice = useDeiPrice()

  const poolBalances = usePoolBalances(pool)

  const secondTokenPrice = (
    (poolBalances[1] * Number(pool.lpToken.symbol === 'DB-LP' ? deiPrice : deusPrice)) /
    poolBalances[0]
  ).toFixed(2)

  const getTokenValue = (symbol: string | undefined, amount: string | undefined): string => {
    if (!amount || !symbol) return '-'
    if (symbol === 'DEI') return (Number(amount) * Number(deiPrice)).toFixed(2).toString()
    else if (symbol === 'DEUS') return (Number(amount) * Number(deusPrice)).toFixed(2).toString()
    else return (Number(amount) * Number(secondTokenPrice)).toFixed(2).toString()
  }

  const token0CurrencyBalance = useCurrencyBalance(account ?? undefined, tokens[0])?.toSignificant(3)
  const token1CurrencyBalance = useCurrencyBalance(account ?? undefined, tokens[1])?.toSignificant(3)

  return (
    <Container>
      <div>
        <BalanceHeader>
          <HStack>
            <IconContainer>
              <Icon src={tokensLogo[0]} width={24} height={24} />
            </IconContainer>
            <HeaderTextLabel>Your {pool?.tokens[0]?.symbol} Balance:</HeaderTextLabel>
          </HStack>
          <HeaderTextValue>
            {account ? (
              <>
                <p>
                  {token0CurrencyBalance} {pool?.tokens[0]?.symbol}{' '}
                </p>
                <p>≈ ${getTokenValue(pool?.tokens[0]?.symbol, token0CurrencyBalance)}</p>
              </>
            ) : (
              <p>wallet not connected</p>
            )}
          </HeaderTextValue>
        </BalanceHeader>
        <BalanceHeader>
          <HStack>
            <IconContainer>
              <Icon src={tokensLogo[1]} width={24} height={24} />
            </IconContainer>
            <HeaderTextLabel isDeus={pool?.tokens[0]?.symbol === 'DEUS'}>
              Your {pool?.tokens[1]?.symbol} Balance:
            </HeaderTextLabel>
          </HStack>
          <HeaderTextValue>
            {account ? (
              <>
                <p>
                  {token1CurrencyBalance} {pool?.tokens[1]?.symbol}
                </p>
                <p>≈ ${getTokenValue(pool?.tokens[1]?.symbol, token1CurrencyBalance)}</p>
              </>
            ) : (
              <p>wallet not connected</p>
            )}
          </HeaderTextValue>
        </BalanceHeader>
        <Divider backgroundColor="transparent" />
        {pool.provideLinks?.length !== 0 && (
          <>
            <DropDownContainer
              onClick={() => {
                setOpen((prev) => !prev)
              }}
              isOpen={isOpen}
            >
              <p>Buy Tokens</p>
              <StyledChevron isOpen={isOpen} />
            </DropDownContainer>
            <DropDownContent isOpen={isOpen}>
              {pool?.provideLinks?.map((link, index) => (
                <DropDownContentOption key={link.id}>
                  <p>Buy {pool?.tokens[index]?.symbol}:</p>
                  <CustomLink href={link.link}>{link.title}</CustomLink>
                </DropDownContentOption>
              ))}
            </DropDownContent>
          </>
        )}
      </div>
    </Container>
  )
}

export default BalanceToken
