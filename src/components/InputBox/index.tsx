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
import { Row, RowBetween, RowCenter, RowEnd } from 'components/Row'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'

export const Wrapper = styled(Row)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
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
  padding: 0px 16px;
  margin: 7px 0px;
  color: ${({ theme }) => theme.red1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    right: 0;
  `}
`

export const CurrencySymbol = styled.div<{ active?: any }>`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  margin-left: 12px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ active }) => active && 'pointer'};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-left: 6px;

  `}
`

export const TopWrapper = styled.div`
  display: flex;
  flex-direction: row;
  font-family: 'IBM Plex Mono';
  width: 100%;
  border-left: 1px solid ${({ theme }) => theme.border1};
  padding: 10px 16px;
  height: 100%;
  position: relative;
`

export const LogoWrapper = styled(RowCenter)<{ active?: any }>`
  height: 100%;
  /* padding-left: 10px; */
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
  margin-left: 8px;
  width: 16px;
  color: ${({ theme }) => theme.bg8};

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left: 4px;
  `}
`

const Balance = styled(RowWrap)<{ disabled?: boolean }>`
  font-family: 'IBM Plex Mono';
  font-weight: 500;
  font-size: 12px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text1};
  width: 20px;

  & > span {
    background: ${({ theme }) => theme.bg2};
    border-radius: 6px;
    padding: 2px 4px;
    font-size: 0.5rem;
    color: ${({ theme }) => theme.text1};

    &:hover {
      color: ${({ theme }) => theme.bg0};
      background: ${({ theme }) => theme.primary1};
      cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    }
  }

  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`

const TokenWrapper = styled(RowBetween)`
  justify-content: flex-start;
`

export const getImageSize = () => {
  return isMobile ? 28 : 32
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
      <TopWrapper>
        <TokenWrapper onClick={onTokenSelect ? () => onTokenSelect() : undefined}>
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
          />
          <CurrencySymbol active={onTokenSelect ? true : false}>
            {currency?.symbol}
            {onTokenSelect ? <ChevronDown /> : null}
          </CurrencySymbol>
        </TokenWrapper>

        <Balance disabled={disabled} onClick={handleClick}>
          balance: {balanceDisplay ? balanceDisplay : '0.00'}
          {!disabled && <span>MAX</span>}
        </Balance>
      </TopWrapper>
      <TopWrapper>
        <NumericalWrapper>
          <NumericalInput
            value={value || ''}
            onUserInput={onChange}
            placeholder={disabled ? '0.0' : 'Enter an amount'}
            autoFocus
            disabled={disabled}
          />
        </NumericalWrapper>
      </TopWrapper>
    </Wrapper>
  )
}
