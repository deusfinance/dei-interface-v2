import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import { ChevronDown } from 'components/Icons'
import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { Row, RowBetween, RowEnd } from 'components/Row'

const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};
  position: relative;
`

const InputWrapper = styled.div`
  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    right: 0;
  `}
`

const CurrencySymbol = styled.div`
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  font-size: 16px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
`

const RightWrapper = styled.div`
  width: 100%;
  padding: 8px;
  position: relative;
  height: 100%;
`

export const LogoWrapper = styled(Row)`
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.border1};
  padding-left: 10px;
  min-width: 48px;
  max-width: 61px; //because of border-right
`

const RowWrap = styled(RowEnd)`
  gap: 10px;
  font-size: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 3px;
  `}
`

const Balance = styled(RowWrap)`
  font-family: 'IBM Plex Mono';
  font-weight: 500;
  font-size: 10px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text2};

  & > span {
    background: ${({ theme }) => theme.bg2};
    border-radius: 6px;
    padding: 2px 4px;
    font-size: 0.5rem;
    color: ${({ theme }) => theme.text1};

    &:hover {
      background: ${({ theme }) => theme.secondary2};
      cursor: pointer;
    }
  }

  &:hover {
    cursor: pointer;
  }
`

const StyledChevron = styled(ChevronDown)`
  size: 20px;
  position: absolute;
  right: 16px;
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function InputBox({
  currency,
  value,
  onChange,
  title,
  disabled,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  title?: string
  disabled?: boolean
}) {
  const { account } = useWeb3React()
  const logo = useCurrencyLogo(currency?.wrapped.address)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
  }, [currencyBalance])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  return (
    <>
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
              style={{ textAlign: 'left', height: '50px', fontSize: '24px', marginLeft: '5px' }}
            />
          </InputWrapper>
        </RightWrapper>
      </Wrapper>
    </>
  )
}

export function CustomInputBox({
  symbol,
  value,
  onChange,
  icon,
  balance,
  placeholder,
  disabled,
}: {
  symbol: string
  value: string
  onChange(values: string): void
  icon: string | StaticImageData
  balance?: string
  placeholder?: string
  disabled?: boolean
}) {
  const handleClick = useCallback(() => {
    if (!balance || !onChange) return
    onChange(balance)
  }, [balance, onChange])

  return (
    <>
      <Wrapper style={{ cursor: 'pointer' }}>
        <LogoWrapper>
          <ImageWithFallback
            src={icon}
            value=""
            width={getImageSize()}
            height={getImageSize()}
            alt={`${symbol} Logo`}
            round
          />
        </LogoWrapper>

        <RightWrapper>
          <RowBetween>
            <CurrencySymbol>{symbol}</CurrencySymbol>
            {balance && (
              <Balance onClick={handleClick}>
                balance: {balance || '0.00'}
                {!disabled && <span>MAX</span>}
              </Balance>
            )}
          </RowBetween>
          <InputWrapper>
            <NumericalInput
              value={value || ''}
              onUserInput={onChange}
              placeholder={placeholder || '0.0'}
              autoFocus
              disabled={disabled}
              style={{ textAlign: 'left', height: '50px', fontSize: '16px', marginLeft: '-3px' }}
            />
          </InputWrapper>
        </RightWrapper>
        <StyledChevron />
      </Wrapper>
    </>
  )
}
