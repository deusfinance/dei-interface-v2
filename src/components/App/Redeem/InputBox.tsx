import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { Currency } from '@sushiswap/core-sdk'

import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/currency'

import { NumericalInput } from 'components/Input'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { ClaimButton } from '.'
import { BDEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import BigNumber from 'bignumber.js'
import { toBN } from 'utils/numbers'
import { useRedeemIouDeiCallback } from 'hooks/useReimbursementCallback'

const Wrapper = styled.div`
  font-family: Inter;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  padding: 0.6rem;
  border-radius: 12px;
  border: 2px solid #2c2c2c;
  width: 100%;
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-direction: column;
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
  background: #352424;
  color: white;
  padding: 13px;
  align-self: center;
  border-radius: 12px;

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
  USDC_amount,
  bDEI_amount,
}: {
  currency: Currency
  value: string
  onChange(values: string): void
  disabled?: boolean
  maxValue: string
  USDC_amount: BigNumber
  bDEI_amount: BigNumber
}) {
  const { account } = useWeb3React()
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)

  const balanceExact = useMemo(() => {
    if (!maxValue) return maxAmountSpend(currencyBalance)?.toExact()
    return maxValue
  }, [currencyBalance, maxValue])

  const handleClick = useCallback(() => {
    if (!balanceExact || !onChange) return
    onChange(balanceExact)
  }, [balanceExact, onChange])

  const ratio = useMemo(() => {
    return value ? toBN(value).div(toBN(maxValue)) : 1
  }, [maxValue, value])

  const [USDC_amount_div, bDEI_amount_div] = useMemo(() => {
    return [bDEI_amount.times(ratio), USDC_amount.times(ratio)]
  }, [USDC_amount, bDEI_amount, ratio])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedeemIouDeiCallback(value.toString())

  const handleRedeemIouDei = useCallback(async () => {
    console.log('called handleRedeemIouDei')
    console.log(redeemCallbackState, redeemCallbackError)
    if (!redeemCallback) return
    try {
      // setAwaitingReimburseConfirmation(true)
      const txHash = await redeemCallback()
      // setAwaitingReimburseConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      // setAwaitingReimburseConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [redeemCallbackState, redeemCallbackError, redeemCallback])

  return (
    <Wrapper>
      <NumericalInput
        value={value || ''}
        onUserInput={onChange}
        placeholder="Enter DEI IOU Amount"
        autoFocus
        disabled={disabled}
        style={{ textAlign: 'left', height: '50px', fontSize: '1rem', marginRight: '6px' }}
      />

      <div style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', gap: '10px' }}>
        <MaxButton onClick={handleClick}>MAX</MaxButton>
        <ClaimButton onClick={() => handleRedeemIouDei()}>
          CLAIM {bDEI_amount_div.toFixed(2).toString()} {BDEI_TOKEN?.symbol} {USDC_amount_div.toFixed(2).toString()}{' '}
          {USDC_TOKEN?.symbol}
        </ClaimButton>
      </div>
    </Wrapper>
  )
}
