import React from 'react'
import styled from 'styled-components'

import { RowBetween } from 'components/Row'
import { useBonderData, useGetRedeemTime } from 'hooks/useBondsPage'
import { Loader } from 'components/Icons'
import { formatAmount } from 'utils/numbers'
import { getRemainingTime } from 'utils/time'

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

export default function InfoBox({ amountIn }: { amountIn: string }) {
  const { deiBonded } = useBonderData()
  const { redeemTime } = useGetRedeemTime(amountIn || '0')
  const { day, hours } = getRemainingTime(redeemTime)
  const roundedDays = day + (hours > 12 ? 1 : 0) //adds 1 more day if remained hours is above 12 hours.

  return (
    <>
      <RedeemInfoWrapper>
        <p>Bond Maturity</p>
        {redeemTime == 0 ? <Loader /> : <ItemValue>~ {roundedDays} days</ItemValue>}
      </RedeemInfoWrapper>
      <RedeemInfoWrapper>
        <p>Total DEI Bonded</p>
        {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
      </RedeemInfoWrapper>
    </>
  )
}
