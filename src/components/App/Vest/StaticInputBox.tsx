import React, { useCallback, useMemo } from 'react'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import useWeb3React from 'hooks/useWeb3'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { RowBetween } from 'components/Row'
import { lastThursday } from 'utils/vest'
import { CurrencySymbol, InputWrapper, LogoWrapper, RightWrapper, Wrapper } from 'components/InputBox'
import { computedVotingPowerFunc } from './UserLockInformation'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

export default function StaticInputBox({
  currency,
  name,
  value,
  selectedDate,
  onChange,
  onTokenSelect,
  disabled,
}: {
  currency: Currency
  name: string
  value: string
  selectedDate: Date
  onChange(values: string): void
  onTokenSelect?: () => void
  disabled?: boolean
}) {
  const logo = useCurrencyLogo((currency as Token)?.address)

  function getImageSize() {
    return isMobile ? 35 : 38
  }

  const { account, chainId } = useWeb3React()

  const effectiveDate: Date = useMemo(() => {
    return lastThursday(selectedDate)
  }, [selectedDate])

  const computedVotingPower = useCallback(() => {
    return computedVotingPowerFunc({ account, chainId, amount: value, effectiveDate })
  }, [account, chainId, value, effectiveDate])

  return (
    <Wrapper>
      <LogoWrapper onClick={onTokenSelect ? () => onTokenSelect() : undefined}>
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
          <CurrencySymbol onClick={onTokenSelect ? () => onTokenSelect() : undefined}>{name}</CurrencySymbol>
        </RowBetween>
        <InputWrapper>
          <NumericalInput
            value={parseFloat(computedVotingPower().toString()) || ''}
            onUserInput={onChange}
            placeholder="0.0"
            autoFocus
            disabled={disabled}
          />
        </InputWrapper>
      </RightWrapper>
    </Wrapper>
  )
}
