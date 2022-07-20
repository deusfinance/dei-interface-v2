import React, { useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'

import useWeb3React from 'hooks/useWeb3'
import { maxAmountSpend } from 'utils/currency'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { PrimaryButton } from 'components/Button'
import { NumericalInput } from 'components/Input'
import { RowBetween } from 'components/Row'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  padding: 0.6rem;
  border: 1px solid gray;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.5rem;
    height: 70px;
  `}
`

const TextData = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.93);
  margin: 0.22rem;
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

const Balance = styled(Row)`
  font-size: 0.7rem;
  text-align: center;
  margin-top: 5px;
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100px;
    font-size: 0.6rem;
    margin-top: 1px;
  `}
`

const TitleBox = styled.div`
  font-size: 0.75rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.62rem;
  `}
`

const ActionButton = styled(PrimaryButton)`
  margin-top: 6px;
  height: 46px;
  width: 170px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 91px;
    height: 35px;
    margin-top: 8px;
    font-size: 0.78rem;
  `}
`

export default function StakeBox({
  currency,
  value,
  onClick,
  onChange,
  title,
  disabled,
  type,
  maxValue,
}: {
  currency: Currency | null
  value: string
  onClick: any
  onChange(value: string): void
  title: string
  disabled?: boolean
  type: string
  maxValue?: string
}) {
  const { account } = useWeb3React()
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const [balanceExact, balanceDisplay] = useMemo(() => {
    if (!maxValue) return [maxAmountSpend(currencyBalance)?.toExact(), currencyBalance?.toSignificant(6)]
    return [maxValue, maxValue]
  }, [currencyBalance, maxValue])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  return (
    <>
      <Wrapper>
        <div style={{ flex: 1 }}>
          <RowBetween alignItems={'center'}>
            {type === 'claim' || type === 'claiming' ? (
              <TextData style={{ opacity: '0' }}>{'.'}</TextData>
            ) : (
              <>
                <TitleBox>{title}</TitleBox>
                {!disabled && (
                  <Balance onClick={handleClick}>
                    {balanceDisplay ? balanceDisplay : '0.00'}
                    <span>MAX</span>
                  </Balance>
                )}
              </>
            )}
          </RowBetween>
          <RowBetween>
            {type === 'claim' || type === 'claiming' ? (
              <TextData style={{ marginTop: '-9px' }}>{value}</TextData>
            ) : (
              <NumericalInput
                value={value || ''}
                onUserInput={onChange}
                placeholder="0.0"
                autoFocus
                disabled={disabled}
                style={{ textAlign: 'left', fontSize: '1.1rem' }}
              />
            )}
          </RowBetween>
        </div>

        <div>
          <ActionButton active onClick={onClick}>
            {type}
          </ActionButton>
        </div>
      </Wrapper>
    </>
  )
}
