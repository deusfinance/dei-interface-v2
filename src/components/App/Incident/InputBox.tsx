import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'

import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import { NumericalInput } from 'components/Input'
import { RowBetween } from '../../Row/index'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { formatBalance } from 'utils/numbers'
import { DEUS_TOKEN } from 'constants/tokens'

const Wrapper = styled.div`
  font-family: Inter;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  padding: 0.6rem;
  border-radius: 12px;
  border: 2px solid #2c2c2c;
  background: #222;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: 10px;
  font-size: 1.5rem;
  align-items: center;
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

const Balance = styled(Row)`
  font-size: 0.7rem;
  text-align: center;
  margin-top: 5px;
  margin-left: 4px;
  gap: 5px;
  color: ${({ theme }) => theme.text1};

  &:hover {
    cursor: pointer;
  }
`

const TokenName = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  padding-left: 4px;
`

const MaxButton = styled.span`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-left: 4px;

  &:hover {
    cursor: pointer;
  }
`

export default function InputBox({
  currency,
  value,
  onChange,
  disabled,
  maxValue,
  onTokenSelect,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  disabled?: boolean
  maxValue?: string | null
  onTokenSelect?: () => void
}) {
  const { account } = useWeb3React()
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const balanceDisplay = useMemo(() => {
    if (!maxValue) return formatBalance(maxAmountSpend(currencyBalance)?.toExact() ?? '0')
    return formatBalance(maxValue)
  }, [currencyBalance, maxValue])

  const balanceExact = useMemo(() => {
    if (!maxValue) return maxAmountSpend(currencyBalance)?.toExact()
    return maxValue
  }, [currencyBalance, maxValue])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  return (
    <Wrapper>
      <RowBetween alignItems={'center'}>
        <TokenName>{currency.symbol === DEUS_TOKEN.symbol ? DEUS_TOKEN.symbol : 'Reimbursable Amount'}</TokenName>
        <Balance onClick={handleClick}>
          <span>Balance: </span> {balanceDisplay ? balanceDisplay : '0.00'}
          {!disabled && <MaxButton>MAX</MaxButton>}
        </Balance>
      </RowBetween>
      <RowBetween>
        <NumericalInput
          value={value || ''}
          onUserInput={onChange}
          placeholder="0.0"
          autoFocus
          disabled={disabled}
          style={{ textAlign: 'left', height: '50px', fontSize: '1.3rem' }}
        />
      </RowBetween>
    </Wrapper>
  )
}
