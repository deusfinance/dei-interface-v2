import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'
import useWeb3React from 'hooks/useWeb3'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'
import { NumericalInput } from 'components/Input'
import { Row, RowBetween, RowCenter } from 'components/Row'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { lastThursday } from 'utils/vest'
import { formatAmount } from 'utils/numbers'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};
`

const InputWrapper = styled.div`
  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    right: 0;
  `}
`

const CurrencySymbol = styled.div<{ active?: any }>`
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  font-size: 16px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ active }) => active && 'pointer'};
`

const RightWrapper = styled.div`
  width: 100%;
  border-left: 1px solid ${({ theme }) => theme.border1};
  padding: 6px;
  height: 100%;
  position: relative;
`

const LogoWrapper = styled(RowCenter)<{ active?: any }>`
  height: 100%;
  padding-left: 10px;
  width: 80px;
  cursor: ${({ active }) => active && 'pointer'};
`

const ChevronDown = styled(ChevronDownIcon)`
  margin-left: 7px;
  width: 16px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left: 4px;
  `}
`

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

  const computedVotingPower: BigNumber = useMemo(() => {
    if (!account || !chainId || !value) return new BigNumber(0)
    const effectiveWeek = Math.floor(dayjs.utc(effectiveDate).diff(dayjs.utc(), 'week', true))
    return new BigNumber(value).times(effectiveWeek).div(208).abs() // 208 = 4 years in weeks
  }, [account, chainId, value, effectiveDate])

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
              {name}
            </CurrencySymbol>
          </RowBetween>
          <InputWrapper>
            <NumericalInput
              value={formatAmount(parseFloat(computedVotingPower.toString()), 6) || ''}
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
