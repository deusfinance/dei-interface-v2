import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import FTM_LOGO from '/public/static/images/tokens/ftm.svg'
import POLYGON_LOGO from '/public/static/images/tokens/polygon.svg'
import MAINNET_LOGO from '/public/static/images/networks/mainnet.svg'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { maxAmountSpend } from 'utils/currency'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { Row, RowBetween, RowCenter, RowEnd } from 'components/Row'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { SupportedChainId } from 'constants/chains'

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

const CurrencySymbol = styled(Row)<{ active?: any }>`
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
  border-radius: 12px 0px 0px 12px;
  &:hover {
    background: ${({ theme }) => theme.text3};
  }

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

const Balance = styled(RowWrap)<{ disabled?: boolean }>`
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
      background: ${({ theme }) => theme.primary1};
      cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    }
  }

  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }
`

const NetworkText = styled.div<{ FantomActive?: boolean; PolygonActive?: boolean; EthereumActive?: boolean }>`
  font-weight: 400;
  font-size: 10px;

  margin-left: 5px;
  margin-top: 2px;
  color: ${({ theme, FantomActive }) => FantomActive && theme.fantomColor};
  color: ${({ theme, PolygonActive }) => PolygonActive && theme.polygonColor};
  color: ${({ theme, EthereumActive }) => EthereumActive && theme.ethereumColor};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 8px;

  `}
`

export const getImageSize = () => {
  return isMobile ? 28 : 32
}

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
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const chainsLogo: { [chainId: number]: any } = {
    [SupportedChainId.FANTOM]: FTM_LOGO,
    [SupportedChainId.POLYGON]: POLYGON_LOGO,
    [SupportedChainId.MAINNET]: MAINNET_LOGO,
  }

  const [balanceExact, balanceDisplay] = useMemo(() => {
    return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
  }, [currencyBalance])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange || disabled) return
    onChange(balanceExact)
  }, [balanceExact, disabled, onChange])

  return (
    <Wrapper>
      <LogoWrapper onClick={onTokenSelect ? () => onTokenSelect() : undefined} active={onTokenSelect ? true : false}>
        <ImageWithFallback
          src={chainsLogo[currency.chainId]}
          width={getImageSize()}
          height={getImageSize()}
          alt={`${currency?.symbol} Logo`}
          round
        />
        {onTokenSelect ? <ChevronDown /> : null}
      </LogoWrapper>

      <RightWrapper>
        <RowBetween>
          <CurrencySymbol
            onClick={onTokenSelect ? () => onTokenSelect() : undefined}
            active={onTokenSelect ? true : false}
          >
            {currency?.symbol}
            <NetworkText
              FantomActive={currency.chainId === SupportedChainId.FANTOM}
              PolygonActive={currency.chainId === SupportedChainId.POLYGON}
              EthereumActive={currency.chainId === SupportedChainId.MAINNET}
            >
              ({SupportedChainId[currency.chainId]})
            </NetworkText>
          </CurrencySymbol>
          <Balance disabled={disabled} onClick={handleClick}>
            balance: {balanceDisplay ? balanceDisplay : '0.00'}
            {!disabled && <span>MAX</span>}
          </Balance>
        </RowBetween>
        <NumericalWrapper>
          <NumericalInput
            value={value || ''}
            onUserInput={onChange}
            placeholder={disabled ? '0.0' : 'Enter an amount'}
            autoFocus
            disabled={disabled}
          />
        </NumericalWrapper>
      </RightWrapper>
    </Wrapper>
  )
}
