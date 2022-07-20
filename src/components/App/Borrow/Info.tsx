import React, { useMemo } from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import { Card } from 'components/Card'
import { Info as InfoIcon } from 'components/Icons'
import { CardTitle } from 'components/Title'
import { ToolTip } from 'components/ToolTip'
import { useGlobalPoolData } from 'hooks/usePoolData'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  & > * {
    font-size: 0.7rem;
    &:last-child {
      margin-left: auto;
    }
  }
`

export default function Info({ pool }: { pool: BorrowPool }) {
  const { liquidationRatio, borrowFee, interestPerSecond } = useGlobalPoolData(pool)
  const annualizedInterest = useMemo(() => {
    return (interestPerSecond * 60 * 60 * 24 * 365 * 100).toFixed(1)
  }, [interestPerSecond])
  return (
    <Wrapper>
      <CardTitle>Info</CardTitle>
      <PositionRow
        label="Liquidation Ratio"
        value={`${liquidationRatio.toSignificant()}%`}
        explanation="The maximum amount of debt you can borrow with a selected collateral token."
      />
      <PositionRow
        label="Borrow Fee "
        value={`${borrowFee.toSignificant()}%`}
        explanation={`This fee is added to your debt every time you borrow DEI.`}
      />
      <PositionRow
        label="Interest Rate "
        value={`${annualizedInterest}%`}
        explanation="This is the annualized percent that your debt will increase each year."
      />
    </Wrapper>
  )
}

function PositionRow({ label, value, explanation }: { label: string; value: string; explanation: string }) {
  return (
    <Row>
      <ToolTip id="id" />
      <InfoIcon data-for="id" data-tip={explanation} />
      <div>{label}</div>
      <div>{value}</div>
    </Row>
  )
}
