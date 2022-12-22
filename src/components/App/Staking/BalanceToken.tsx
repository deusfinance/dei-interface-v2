import ImageWithFallback from 'components/ImageWithFallback'
import styled, { css } from 'styled-components'
import Container from './common/Container'
import { Divider, HStack } from './common/Layout'
import Down2 from '/public/static/images/pages/stake/down2.svg'
import { useState } from 'react'
import { ChevronDown } from 'components/Icons'
import useWeb3React from 'hooks/useWeb3'
import { LiquidityType } from 'constants/stakingPools'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import Link from 'next/link'
import { ExternalLink } from 'components/Link'
import { useCurrencyBalance } from 'state/wallet/hooks'

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
const HeaderTextLabel = styled.p<{ isDeus: boolean }>`
  background: ${({ isDeus, theme }) => (isDeus ? theme.deusColor : theme.deiColor)};
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

const BalanceToken = ({ pool }: { pool: LiquidityType }) => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const { account } = useWeb3React()

  const { tokens } = pool
  const tokensAddress = tokens.map((token) => token.address)
  const tokensLogo = useCurrencyLogos(tokensAddress)

  const token0CurrencyBalance = useCurrencyBalance(account ?? undefined, tokens[0])?.toSignificant(6)
  const token1CurrencyBalance = useCurrencyBalance(account ?? undefined, tokens[1])?.toSignificant(6)

  return (
    <Container>
      <div style={{ marginInline: 12 }}>
        <BalanceHeader>
          <HStack>
            <IconContainer>
              <Icon src={tokensLogo[0]} width={24} height={24} />
            </IconContainer>
            <HeaderTextLabel isDeus={pool?.tokens[0]?.symbol === 'DEUS'}>
              Your {pool?.tokens[0]?.symbol} Balance:
            </HeaderTextLabel>
          </HStack>
          <HeaderTextValue>
            {account ? (
              <>
                <p>
                  {token0CurrencyBalance} {pool?.tokens[0]?.symbol}{' '}
                </p>
                <p>≈ $??</p>
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
                <p>≈ $??</p>
              </>
            ) : (
              <p>wallet not connected</p>
            )}
          </HeaderTextValue>
        </BalanceHeader>
        <Divider backgroundColor="transparent" />
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
          <DropDownContentOption>
            {/* FIXME: complete here */}
            <p>Buy {pool?.tokens[0]?.symbol}:</p>
            <ExternalLink href="https://app.firebird.finance/swap?outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44&net=250">
              Buy on Firebird <ImageWithFallback alt="balance" width={8} height={8} src={Down2} />
            </ExternalLink>
          </DropDownContentOption>
          <DropDownContentOption>
            <p>Buy {pool?.tokens[1]?.symbol}:</p>
            <Link href="/swap">Go to Swap Page</Link>
          </DropDownContentOption>
        </DropDownContent>
      </div>
    </Container>
  )
}

export default BalanceToken
