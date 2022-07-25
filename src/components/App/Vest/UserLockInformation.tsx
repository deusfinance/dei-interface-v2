import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'

import { lastThursday } from 'utils/vest'
import { formatAmount } from 'utils/numbers'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled.div`
  font-family: 'Inter';
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin-top: 20px;
  gap: 10px;
`

const Row = styled.div<{ active?: boolean; isModal?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  font-size: 0.8rem;

  & > * {
    &:last-child {
      color: ${({ theme, isModal, active }) => (isModal ? (active ? theme.text1 : theme.text2) : theme.text1)};
    }
    color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  }
`

const Title = styled.div`
  font-size: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.border1};
  margin-bottom: 5px;
  padding-bottom: 5px;
  font-weight: bold;
  color: ${({ theme }) => theme.text2};
`

const TotalVP = styled.div<{ isModal?: boolean }>`
  ${({ isModal }) =>
    !isModal &&
    `
    background: -webkit-linear-gradient(1deg, #0badf4, #30efe4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

export function computedVotingPowerFunc({
  account,
  chainId,
  amount,
  effectiveDate,
}: {
  account: any
  chainId: number | undefined
  amount: string
  effectiveDate: Date
}): BigNumber {
  if (!account || !chainId || !amount) return new BigNumber(0)
  const effectiveWeek = Math.floor(dayjs.utc(effectiveDate).diff(dayjs.utc(), 'week', true))
  return new BigNumber(amount).times(effectiveWeek).div(208).abs() // 208 = 4 years in weeks
}

export default function UserLockInformation({
  amount,
  selectedDate,
  currentVotingPower,
  title,
  increaseType,
  isNew,
  isModal,
}: {
  amount: string
  selectedDate: Date
  currentVotingPower?: string
  title?: string
  increaseType?: string // 1: Amount, 2: Duration
  isNew?: boolean
  isModal?: boolean
}) {
  const { account, chainId } = useWeb3React()

  const effectiveDate: Date = useMemo(() => {
    return lastThursday(selectedDate)
  }, [selectedDate])

  const computedVotingPower = useCallback(() => {
    return computedVotingPowerFunc({ account, chainId, amount, effectiveDate })
  }, [account, chainId, amount, effectiveDate])

  const totalVotingPower: string = useMemo(() => {
    const current = currentVotingPower ? parseFloat(currentVotingPower) : 0
    return computedVotingPower().plus(current).toFixed(2)
  }, [computedVotingPower, currentVotingPower])

  const { userAPY } = useVestedAPY(undefined, effectiveDate)

  // const durationUntilTarget: string = useMemo(() => {
  //   return dayjs.utc(effectiveDate).fromNow(true)
  // }, [effectiveDate])

  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      <Row active={increaseType === '1' && isNew} isModal={isModal}>
        <div>Total voting Power:</div>
        <TotalVP isModal={isModal}>{totalVotingPower} veDEUS</TotalVP>
      </Row>
      <Row active={increaseType === '2' && isNew} isModal={isModal}>
        <div>Est. APR</div>
        <div>{formatAmount(parseFloat(userAPY), 0)}%</div>
      </Row>
      {/* <Row>
        <div>Expiration in: </div>
        {lockHasEnded ? <div>Expired</div> : <div>~ {durationUntilTarget}</div>}
      </Row> */}
      <Row active={increaseType === '2' && isNew} isModal={isModal}>
        <div>Locked until: (UTC)</div>
        <div>{dayjs.utc(effectiveDate).format('LL')}</div>
      </Row>
    </Wrapper>
  )
}
