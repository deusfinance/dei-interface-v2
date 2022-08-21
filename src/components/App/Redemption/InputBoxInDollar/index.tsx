import React from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
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
  `}
`

export const InputWrapper = styled.div`
  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 0;
  `}
`

const NumericalWrapper = styled.div`
  width: 100%;
  font-size: 24px;
  position: relative;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    right: 0;
  `}
`

const DeusText = styled(DeusTitle)<{ fromLeft?: string }>`
  position: absolute;
  top: 21px;
  left: ${({ fromLeft }) => (fromLeft ? fromLeft : 0)};
  font-weight: 500;
  font-size: 12px;
  margin-left: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: 14px;
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
  position: relative;
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

const DollarSign = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-right: -4px;
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

function getWidth(length: number): number {
  if (isMobile) return length <= 12 ? length * 9 : 115
  return length <= 20 ? length * 15 : 305
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
          <DollarSign>$</DollarSign>
          <NumericalInput value={value || ''} onUserInput={() => console.log()} />
          {value && <DeusText fromLeft={`${getWidth(value.length)}px`}>in DEUS</DeusText>}
        </NumericalWrapper>
      </RightWrapper>
    </Wrapper>
  )
}
