import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { Row, RowBetween, RowCenter, RowEnd } from 'components/Row'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'

export const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 60px;
  `}
`

export const InputWrapper = styled.div`
  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    right: 0;
  `}
`

export const CurrencySymbol = styled.div<{ active?: any }>`
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  font-size: 16px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ active }) => active && 'pointer'};
`

export const RightWrapper = styled.div`
  width: 100%;
  border-left: 1px solid ${({ theme }) => theme.border1};
  padding: 6px;
  height: 100%;
  position: relative;
`

export const LogoWrapper = styled(RowCenter)<{ active?: any }>`
  height: 100%;
  padding-left: 10px;
  width: 80px;
  cursor: ${({ active }) => active && 'pointer'};
`

export const RowWrap = styled(RowEnd)`
  gap: 10px;
  font-size: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
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

const Balance = styled(RowWrap)<{ disabled?: boolean }>`
  font-family: 'IBM Plex Mono';
  font-weight: 500;
  font-size: 10px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text2};
  width: 20px;

  & > span {
    background: ${({ theme }) => theme.bg2};
    border-radius: 6px;
    padding: 2px 4px;
    font-size: 0.5rem;
    color: ${({ theme }) => theme.text1};

    &:hover {
      background: ${({ theme }) => theme.secondary2};
      cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    }
  }

  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`

export default function InputBox({
  currency,
  value,
  onChange,
  onTokenSelect,
  disabled,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  onTokenSelect?: () => void
  disabled?: boolean
}) {
  const { account } = useWeb3React()
  const logo = useCurrencyLogo((currency as Token)?.address)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
  }, [currencyBalance])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  function getImageSize() {
    return isMobile ? 35 : 38
  }

  return (
    <>
      <Wrapper>
        <LogoWrapper onClick={onTokenSelect ? () => onTokenSelect() : undefined} active={onTokenSelect ? true : false}>
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
          />
          {onTokenSelect ? <ChevronDown /> : <></>}
        </LogoWrapper>

        <RightWrapper>
          <RowBetween>
            <CurrencySymbol
              onClick={onTokenSelect ? () => onTokenSelect() : undefined}
              active={onTokenSelect ? true : false}
            >
              {currency?.symbol}
            </CurrencySymbol>
            <Balance onClick={handleClick}>
              balance: {balanceDisplay ? balanceDisplay : '0.00'}
              {!disabled && <span>MAX</span>}
            </Balance>
          </RowBetween>
          <InputWrapper>
            <NumericalInput
              value={value || ''}
              onUserInput={onChange}
              placeholder="0.0"
              autoFocus
              disabled={disabled}
              style={{ textAlign: 'left', fontSize: '24px', marginLeft: '5px' }}
            />
          </InputWrapper>
        </RightWrapper>
      </Wrapper>
    </>
  )
}
