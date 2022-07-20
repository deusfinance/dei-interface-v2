import React from 'react'
import styled from 'styled-components'

import { useRedeemData } from 'hooks/useRedemptionPage'
// import { formatAmount } from 'utils/numbers'
// import { getRemainingTime } from 'utils/time'

import { RowBetween, RowEnd, RowStart } from 'components/Row'
// import { CountDown } from 'components/App/Redemption/CountDown'
import { Loader } from 'components/Icons'
import { formatAmount } from 'utils/numbers'

const RedeemInfoWrapper = styled(RowBetween)`
  align-items: center;
  margin-top: 1px;
  height: 30px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  max-width: 500px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:90%;
  `}
`

const ItemValue = styled.div`
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;
`

export default function RedemptionInfoBox() {
  const { redeemTranche, deiBurned } = useRedeemData()
  // const { diff, day, hours, minutes, seconds } = getRemainingTime(redeemTranche.endTime)

  const showLoader = redeemTranche.trancheId == null ? true : false
  // const roundedDays = day + (hours > 12 ? 1 : 0) //adds 1 more day if remained hours is above 12 hours.

  return (
    <>
      {/* <RedeemInfoWrapper>
        <RowStart>End Time</RowStart>
        {showLoader ? (
          <Loader />
        ) : diff < 0 ? (
          <ItemValue>Ended</ItemValue>
        ) : day > 0 ? (
          <ItemValue>{`~ ${roundedDays} day${roundedDays > 1 ? 's' : ''}`}</ItemValue>
        ) : (
          <CountDown hours={hours} minutes={minutes} seconds={seconds} />
        )}
      </RedeemInfoWrapper> */}

      <RedeemInfoWrapper>
        <RowStart>
          USDC Ratio:<ItemValue>{showLoader ? <Loader /> : redeemTranche.USDRatio}</ItemValue>
        </RowStart>
        <RowEnd>
          DEUS Ratio:<ItemValue>{showLoader ? <Loader /> : redeemTranche.deusRatio}</ItemValue>
        </RowEnd>
      </RedeemInfoWrapper>
      <RedeemInfoWrapper>
        <p>Total DEI Redeemed</p>
        {showLoader ? <Loader /> : <ItemValue>{formatAmount(deiBurned)}</ItemValue>}
      </RedeemInfoWrapper>
      {/* <RedeemInfoWrapper>
        <p>Remaining USDC Amount</p>
        {showLoader ? <Loader /> : <ItemValue>{formatAmount(redeemTranche.amountRemaining)}</ItemValue>}
      </RedeemInfoWrapper> */}
      {/* <RedeemInfoWrapper>
        <p>Redemption Fee</p>
        {showLoader ? <Loader /> : <ItemValue>{redemptionFee || 'Zero'}</ItemValue>}
      </RedeemInfoWrapper> */}
    </>
  )
}
