import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import useWeb3React from 'hooks/useWeb3'

import ImageWithFallback from 'components/ImageWithFallback'
import { RowBetween } from 'components/Row'

const Wrapper = styled(RowBetween).attrs({
  align: 'center',
})<{ disabled?: boolean }>`
  display: flex;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 60px;
  gap: 10px;
  padding: 0px 1rem;
  margin: 0 auto;
  border: 1px solid ${({ theme, disabled }) => (disabled ? theme.bg2 : theme.border3)};
  background: ${({ theme }) => theme.bg1};

  &:hover {
    background: ${({ theme, disabled }) => (disabled ? theme.bg1 : theme.bg3)};
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  font-size: 1.5rem;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 3px;
  `}
`

const Balance = styled.div<{ disabled?: boolean }>`
  font-size: 1rem;
  text-align: center;
  color: ${({ theme, disabled }) => (disabled ? theme.text3 : theme.text1)};
`

const Symbol = styled.p<{ disabled?: boolean }>`
  margin-left: 8px;
  font-size: 1rem;
  color: ${({ theme, disabled }) => (disabled ? theme.text3 : theme.text1)};
`

export default function TokenBox({
  currency,
  index,
  toggleModal,
  setToken,
  disabled,
}: {
  currency: Currency
  index: number
  toggleModal: (action: boolean) => void
  setToken: (index: number) => void
  disabled?: boolean
}) {
  const { account } = useWeb3React()
  const tokenAddress = currency.isToken ? currency.address : currency.wrapped.address
  const logo = useCurrencyLogo(tokenAddress)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const balanceDisplay = useMemo(() => currencyBalance?.toSignificant(6), [currencyBalance])

  // const tokenAddress2 = currency[1]?.isToken ? currency[1].address : currency[1].wrapped.address
  // const logo2 = useCurrencyLogo(tokenAddress2)
  // const currencyBalance2 = useCurrencyBalance(account ?? undefined, currency[1] ?? undefined)
  // const balanceDisplay2 = useMemo(() => currencyBalance2?.toSignificant(6), [currencyBalance2])

  function getImageSize() {
    return isMobile ? 28 : 32
  }

  return (
    <Wrapper
      disabled={disabled}
      onClick={() => {
        toggleModal(false)
        if (!disabled) setToken(index)
      }}
    >
      <div>
        <Row>
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
          />
          <Symbol disabled={disabled}>{currency?.symbol}</Symbol>
        </Row>
      </div>
      <Balance disabled={disabled}>{balanceDisplay ? balanceDisplay : '0.00'}</Balance>
    </Wrapper>
  )
}
