import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { Row, RowCenter, RowEnd } from 'components/Row'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { HStack } from './Layout'

export const Wrapper = styled(Row)`
  width: 410.488px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `}
`

const NumericalWrapper = styled.div`
  font-size: 24px;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    right: 0;
  `}
  &> input {
    width: 70%;
    ::placeholder {
      color: ${({ theme }) => theme.text1};
    }

    :-ms-input-placeholder {
      color: ${({ theme }) => theme.text1};
    }

    ::-ms-input-placeholder {
      color: ${({ theme }) => theme.text1};
    }
  }
`

export const CurrencySymbol = styled.div<{ active?: any }>`
  font-weight: 500;
  font-size: 16px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ active }) => active && 'pointer'};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-left: 6px;

  `}
`

export const RightWrapper = styled(HStack)`
  width: 100%;
  border-left: 1px solid ${({ theme }) => theme.border1};
  padding: 8px;
  padding-left: 10px;
  height: 100%;
  position: relative;
  justify-content: space-between;
`

export const LogoWrapper = styled(RowCenter)<{ active?: any }>`
  height: 100%;
  width: 66.387px;
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

export default function InputBox({
  currency,
  value,
  onChange,
  onTokenSelect,
  maxValue,
  disabled,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  onTokenSelect?: () => void
  maxValue?: string | null
  disabled?: boolean
}) {
  const { account } = useWeb3React()
  const logo = useCurrencyLogo((currency as Token)?.address)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    if (!maxValue) return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
    return [maxValue, maxValue]
  }, [currencyBalance, maxValue])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange || disabled) return
    onChange(balanceExact)
  }, [balanceExact, disabled, onChange])

  return (
    <Wrapper>
      <LogoWrapper onClick={onTokenSelect ? () => onTokenSelect() : undefined} active={onTokenSelect ? true : false}>
        <ImageWithFallback
          src={logo}
          width={getImageSize()}
          height={getImageSize()}
          alt={`${currency?.symbol} Logo`}
          round
        />
        {onTokenSelect ? <ChevronDown /> : null}
      </LogoWrapper>

      <RightWrapper>
        <NumericalWrapper>
          <NumericalInput
            value={value || ''}
            onUserInput={onChange}
            placeholder={disabled ? '0.0' : 'Enter an amount'}
            autoFocus
            disabled={disabled}
          />
        </NumericalWrapper>
        <CurrencySymbol
          onClick={onTokenSelect ? () => onTokenSelect() : undefined}
          active={onTokenSelect ? true : false}
        >
          {currency?.symbol}
        </CurrencySymbol>
      </RightWrapper>
    </Wrapper>
  )
}
