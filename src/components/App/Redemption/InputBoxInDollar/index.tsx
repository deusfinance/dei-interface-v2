import React from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'
import { Row, RowBetween, RowCenter, RowEnd } from 'components/Row'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { DeusTitle } from 'components/App/Dashboard/Stats'

export const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `};
`

const NumericalWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  text-align: left;
  width: 100%;
  font-size: 24px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    right: 0;
  `}
`

const DeusText = styled(DeusTitle)<{ fromLeft?: string }>`
  font-weight: 500;
  font-size: 12px;
  margin-left: 6px;
  margin-top: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 10px;
  `}
`

const ValueText = styled.div`
  overflow: scroll;
  max-width: 300px;
  margin-top: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 240px;
    margin-left: 5px;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 120px;
  `}
`

export const CurrencySymbol = styled.div<{ active?: any }>`
  font-weight: 600;
  font-size: 16px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ active }) => active && 'pointer'};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-left: 6px;

  `}
`

export const RightWrapper = styled.div`
  width: 100%;
  border-left: 1px solid ${({ theme }) => theme.border1};
  padding: 8px;
  padding-left: 10px;
  height: 100%;
`

export const LogoWrapper = styled(RowCenter)<{ active?: any }>`
  height: 100%;
  width: 80px;
  cursor: ${({ active }) => active && 'pointer'};
`

export const RowWrap = styled(RowEnd)`
  gap: 10px;
  font-size: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 3px;
  `}
`

export const ChevronDown = styled(ChevronDownIcon)`
  margin-left: 7px;
  width: 16px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left: 4px;
  `}
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function InputBoxInDollar({ currency, value }: { currency: Currency; value: string }) {
  const logo = useCurrencyLogo((currency as Token)?.address)

  return (
    <Wrapper>
      <LogoWrapper>
        <ImageWithFallback
          src={logo}
          width={getImageSize()}
          height={getImageSize()}
          alt={`${currency?.symbol} Logo`}
          round
        />
      </LogoWrapper>

      <RightWrapper>
        <RowBetween>
          <CurrencySymbol>{currency?.symbol}</CurrencySymbol>
        </RowBetween>
        <NumericalWrapper>
          <ValueText>${value ? value : ''}</ValueText>
          {value && <DeusText>in DEUS</DeusText>}
        </NumericalWrapper>
      </RightWrapper>
    </Wrapper>
  )
}
