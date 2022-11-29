import React from 'react'
import styled from 'styled-components'

import { ToolTip } from 'components/ToolTip'
import { Info } from 'components/Icons'
import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ExternalLink } from 'components/Link'
import Dropdown2 from 'components/DropDown2'
import { Token } from '@sushiswap/core-sdk'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import ImageWithFallback from 'components/ImageWithFallback'
import { Stakings } from 'constants/stakingPools'

const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  margin: 1px 2px 0px 2px;
  display: flex;
  justify-content: center;
  /* position: absolute; */
  /* bottom: 0px; */

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: stretch;
  `};
`

const Item = styled.div<{ rightBorder?: boolean }>`
  display: inline-block;
  padding: 0 75px;
  border-right: ${({ theme, rightBorder }) => (rightBorder ? `1px solid ${theme.border1}` : 'unset')};
`

const Item2 = styled.div`
  display: flex;
  align-items: center;
  padding: 0 50px;
`

const ItemBox = styled.div`
  display: inline-block;
  padding: 8px 10px;
  margin: 0 24px;
  background: ${({ theme }) => theme.bg4};
  border: 2px solid ${({ theme }) => theme.text3};
  border-radius: 8px;
`

const Name = styled.div`
  font-family: 'Inter';
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  white-space: nowrap;
`

const Value = styled.div`
  font-weight: 500;
  font-size: 14px;
  margin-top: 10px;
  background: ${({ theme }) => theme.deiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const ValueLink = styled(Value)`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.darkPink};
  }
`

const CustomTooltip = styled(ToolTip)`
  max-width: 380px !important;
`

const InfoIcon = styled(Info)`
  color: ${({ theme }) => theme.yellow4};
`

const AprWrapper = styled.a`
  align-items: center;
  text-decoration: none;
  justify-content: center;
  color: ${({ theme }) => theme.text1};
  display: flex;

  :hover {
    opacity: 0.7;
    text-decoration: underline;
    color: ${({ theme }) => theme.yellow4};
  }
  :focus {
    outline: none;
  }
`

const TextContent = styled.p`
  margin-right: 10px;
  font-size: 14px;
`

const ItemBox2 = styled.div<{ rightBorder?: boolean }>`
  display: inline-block;
  padding: 8px 10px;
  margin: 0;
  border-right: ${({ theme, rightBorder }) => (rightBorder ? `1px solid ${theme.border1}` : 'unset')};
`

const DropDownItem = styled(Item2)`
  padding: 0px 0px;
`

const MultipleImageWrapper = styled.div`
  display: flex;
  margin: 8px 8px 8px 12px;

  & > * {
    &:nth-child(2) {
      transform: translateX(-30%);
      margin-right: -9px;
    }
    &:nth-child(3) {
      transform: translateX(-60%);
      margin-right: -9px;
    }
    &:nth-child(4) {
      transform: translateX(-90%);
      margin-right: -9px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      width: 28px;
      height: 28px;
    }
  `}
`
const SingleImageWrapper = styled.div`
  min-width: 22px;
  margin: 8px 8px 8px 12px;
`

function DropDownOption(tokens: Token[], poolName: string): JSX.Element {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)

  function getImageSize() {
    return isMobile ? 22 : 22
  }

  return (
    <DropDownItem>
      {tokens.length > 1 ? (
        <>
          <MultipleImageWrapper>
            {logos.map((logo, index) => {
              return (
                <ImageWithFallback
                  src={logo}
                  width={getImageSize()}
                  height={getImageSize()}
                  alt={`Logo`}
                  key={index}
                  round
                />
              )
            })}
          </MultipleImageWrapper>
          <div>
            {tokens.map((token, index) => {
              return (
                <span key={index}>
                  <span>{token.name}</span>
                  {index + 1 !== tokens.length && <span>-</span>}
                </span>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <SingleImageWrapper>
            <ImageWithFallback src={logos[0]} width={getImageSize()} height={getImageSize()} alt={`Logo`} round />
          </SingleImageWrapper>
          <div>{poolName}</div>
        </>
      )}
    </DropDownItem>
  )
}

export default function StatsHeader({
  items,
  hasBox,
  pid,
  onSelectDropDown,
}: {
  items: { name: string; value: string | number; link?: string }[]
  hasBox?: boolean
  pid?: number
  onSelectDropDown?: (index: number) => void
}) {
  const dropDownOptions = Stakings.map((staking) => {
    const { name, tokens, id } = staking
    // console.log({ name, tokens, id })
    return { value: name, label: DropDownOption(tokens, name), index: id }
  })

  return (
    <Wrapper>
      {onSelectDropDown && (
        <ItemBox2 rightBorder>
          <Dropdown2
            options={dropDownOptions}
            defaultValue={pid}
            placeholder={''}
            onSelect={onSelectDropDown}
            width={'250px'}
          />
        </ItemBox2>
      )}

      {items.map((item, index) => (
        <Item key={index} rightBorder={index < items.length - 1 || hasBox}>
          <Name>{item.name}</Name>
          {!item.link ? (
            <Value>{item.value}</Value>
          ) : (
            <ExternalLink href={ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + item.link}>
              <ValueLink>{item.value}</ValueLink>
            </ExternalLink>
          )}
        </Item>
      ))}
      {hasBox && (
        <ItemBox data-for="id" data-tip={'Rewards are accruing in the background'}>
          <CustomTooltip id="id" />
          <AprWrapper target={'target'} href={'https://lafayettetabor.medium.com/vedeus-dynamics-40a4a5489ae1'}>
            <TextContent>APR</TextContent> <InfoIcon size={20} />
          </AprWrapper>
        </ItemBox>
      )}
    </Wrapper>
  )
}
