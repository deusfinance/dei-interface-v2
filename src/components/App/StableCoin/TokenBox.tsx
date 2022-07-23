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
})`
  display: flex;
  border-radius: 15px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 60px;
  gap: 10px;
  padding: 0px 1rem;
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.border3};
  background: ${({ theme }) => theme.bg2};

  &:hover {
    background: ${({ theme }) => theme.bg1};
    cursor: pointer;
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

const Balance = styled.div`
  font-size: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text1};
`

export default function TokenBox({
  currency,
  toggleModal,
  setToken,
}: {
  currency: Currency
  toggleModal: (action: boolean) => void
  setToken: (currency: Currency) => void
}) {
  const { account } = useWeb3React()
  const tokenAddress = currency.isToken ? currency.address : currency.wrapped.address
  const logo = useCurrencyLogo(tokenAddress)
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const balanceDisplay = useMemo(() => currencyBalance?.toSignificant(6), [currencyBalance])

  function getImageSize() {
    return isMobile ? 28 : 36
  }

  return (
    <Wrapper
      onClick={() => {
        toggleModal(false)
        setToken(currency)
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
          <p style={{ marginLeft: '8px', fontSize: '1rem', color: '#ccc' }}>{currency?.symbol}</p>
        </Row>
      </div>
      <Balance>{balanceDisplay ? balanceDisplay : '0.00'}</Balance>
    </Wrapper>
  )
}
