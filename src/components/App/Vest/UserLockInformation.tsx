import React, { useMemo } from 'react'
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
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  gap: 0px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  font-size: 0.8rem;

  & > * {
    color: ${({ theme }) => theme.text1};
    &:last-child {
      color: ${({ theme }) => theme.text2};
    }
  }
`

const Title = styled.div`
  font-size: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.border1};
  margin-bottom: 5px;
  padding-bottom: 5px;
  font-weight: bold;
`

export default function UserLockInformation({
  amount,
  selectedDate,
  currentVotingPower,
  title,
}: {
  amount: string
  selectedDate: Date
  currentVotingPower?: string
  title?: string
}) {
  const { account, chainId } = useWeb3React()

  const effectiveDate: Date = useMemo(() => {
    return lastThursday(selectedDate)
  }, [selectedDate])

  const lockHasEnded = useMemo(() => dayjs.utc(effectiveDate).isBefore(dayjs.utc()), [effectiveDate])

  const computedVotingPower: BigNumber = useMemo(() => {
    if (!account || !chainId || !amount) return new BigNumber(0)
    const effectiveWeek = Math.floor(dayjs.utc(effectiveDate).diff(dayjs.utc(), 'week', true))
    return new BigNumber(amount).times(effectiveWeek).div(208).abs() // 208 = 4 years in weeks
  }, [account, chainId, amount, effectiveDate])

  const totalVotingPower: string = useMemo(() => {
    const current = currentVotingPower ? parseFloat(currentVotingPower) : 0
    return computedVotingPower.plus(current).toFixed(2)
  }, [computedVotingPower, currentVotingPower])

  const { userAPY } = useVestedAPY(undefined, effectiveDate)

  const durationUntilTarget: string = useMemo(() => {
    return dayjs.utc(effectiveDate).fromNow(true)
  }, [effectiveDate])

  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      <Row>
        <div>Voting Power:</div>
        <div>{totalVotingPower} veDEUS</div>
      </Row>
      <Row>
        <div>Est. APR</div>
        <div>{formatAmount(parseFloat(userAPY), 0)}%</div>
      </Row>
      <Row>
        <div>Expiration in: </div>
        {lockHasEnded ? <div>Expired</div> : <div>~ {durationUntilTarget}</div>}
      </Row>
      <Row>
        <div>Locked until: (UTC)</div>
        <div>{dayjs.utc(effectiveDate).format('LL')}</div>
      </Row>
    </Wrapper>
  )
}
