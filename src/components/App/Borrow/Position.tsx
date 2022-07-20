import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { BorrowPool } from 'state/borrow/reducer'
import { useCurrenciesFromPool } from 'state/borrow/hooks'

import useWeb3React from 'hooks/useWeb3'
import {
  useAvailableToBorrow,
  useCollateralPrice,
  useGlobalPoolData,
  useHealthRatio,
  useLiquidationPrice,
  useUserPoolData,
} from 'hooks/usePoolData'
import { useLPData } from 'hooks/useLPData'
import { useGeneralLenderContract } from 'hooks/useContract'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { Card } from 'components/Card'
import { DotFlashing, Info } from 'components/Icons'
import { CardTitle } from 'components/Title'
import { ToolTip } from 'components/ToolTip'
import { PrimaryButton } from 'components/Button'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  max-width: 280px;

  /* & > * {
    &:last-child {
      margin-top: auto;
    }
  } */

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 100%;
  `}
`

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 2px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  & > * {
    font-size: 0.6rem;
    &:last-child {
      margin-left: auto;
    }
  }
`
//TODO: it hurt my brain to make it just with {color && theme[color]}, but i didn't find a good way without TS type warning!
const RowValue = styled.div<{
  color?: string
}>`
  color: ${({ theme, color }) =>
    color &&
    ((color == 'green1' && theme.green1) || (color == 'red1' && theme.red1) || (color == 'yellow2' && theme.yellow2))};
`

const SubLabel = styled.div`
  font-size: 0.5rem;
  margin-left: 25px;
`

const StyledPrimaryButton = styled(PrimaryButton)`
  font-size: 0.8rem;
  padding: 1rem 0;
`

export default function Position({ pool }: { pool: BorrowPool }) {
  const { borrowCurrency } = useCurrenciesFromPool(pool)
  const { userCollateral, userDebt, userHolder } = useUserPoolData(pool)
  const borrowable = useAvailableToBorrow(pool)
  const { maxCap, borrowedElastic, borrowFee } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)
  const liquidationPrice = useLiquidationPrice(pool)
  const [healthRatio, healthColor, healthText] = useHealthRatio(pool)
  const healthTitle = parseFloat(healthRatio) != 0 ? `| ${healthText.toUpperCase()}` : ''
  const generalLender = useGeneralLenderContract(pool)
  const { balance0, balance1 } = useLPData(pool, userHolder)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const { account } = useWeb3React()

  const borrowSymbol = useMemo(() => {
    return borrowCurrency?.symbol ?? ''
  }, [borrowCurrency])

  const collateralUSDValue = useMemo(() => {
    return new BigNumber(userCollateral).times(collateralPrice).toNumber()
  }, [userCollateral, collateralPrice])

  const onClaim = useCallback(async () => {
    try {
      if (!generalLender || !account) return
      setAwaitingClaimConfirmation(true)
      await generalLender.claimAndWithdraw([pool.lpPool], account)
      setAwaitingClaimConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimConfirmation(false)
    }
  }, [generalLender, pool, account])

  function getClaimButton() {
    if (awaitingClaimConfirmation) {
      return (
        <StyledPrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </StyledPrimaryButton>
      )
    }
    return <StyledPrimaryButton onClick={onClaim}>Claim Rewards</StyledPrimaryButton>
  }
  const numerator = (100 - parseFloat(borrowFee.toSignificant())) / 100

  return (
    <Wrapper>
      <CardTitle>Your Position</CardTitle>
      <PositionRow
        label="Max Cap"
        value={`${formatAmount(parseFloat(maxCap), 0)} DEI`}
        explanation="Max Capacity for borrowing DEI"
      />
      <PositionRow
        label="Total Remaining Cap"
        value={`${formatAmount((parseFloat(maxCap) - parseFloat(borrowedElastic)) * numerator, 0)} DEI`}
        explanation="Total Remaining Capacity for borrowing DEI"
      />
      <PositionRow
        label="Health Ratio"
        value={`${healthRatio} ${healthTitle}`}
        color={healthColor}
        explanation={`${healthRatio} is your current health in your Position.`}
      />
      <PositionRow
        label="Collateral Deposited"
        value={formatAmount(parseFloat(userCollateral), 4)}
        explanation="Amount of Tokens Deposited as Collateral"
      />
      <PositionRow
        label="Collateral Value"
        value={formatDollarAmount(collateralUSDValue, 4)}
        explanation={`${borrowSymbol} Value of the Collateral Deposited in your Position`}
      />
      <PositionRow
        label="Outstanding Debt"
        value={`${formatAmount(parseFloat(userDebt), 4)} DEI`}
        explanation={`${borrowSymbol} Amount that is considered Debt`}
      />
      <PositionRow
        label="LP Token Price"
        value={`${formatDollarAmount(parseFloat(collateralPrice), 4)}`}
        explanation="LP Token Price"
      />
      <PositionRow
        label="Liquidation Price"
        value={`${formatDollarAmount(parseFloat(liquidationPrice), 4)}`}
        explanation="Collateral Price at which your Position will be Liquidated"
      />
      <PositionRow
        label={`${borrowSymbol} Left to Borrow`}
        value={`${formatAmount(parseFloat(borrowable), 0)} DEI`}
        explanation={`${borrowSymbol} Borrowable based on the Collateral Deposited`}
      />
      {parseFloat(balance0) > 0 && (
        <>
          <PositionRow
            label="Underlying LP Rewards"
            subLabel={`${formatAmount(parseFloat(balance0), 2)} SOLID + ${formatAmount(parseFloat(balance1), 2)} SEX`}
            value=""
            explanation="SEX + SOLID your position has earned so far"
          />
          {parseFloat(balance0) > 0 && getClaimButton()}
        </>
      )}
    </Wrapper>
  )
}

function PositionRow({
  label,
  subLabel,
  value,
  explanation,
  color,
}: {
  label: string
  subLabel?: string
  value: string
  explanation: string
  color?: string
}) {
  return (
    <Column>
      <Row>
        <ToolTip id="id" />
        <Info data-for="id" data-tip={explanation} size={15} />
        <div>{label}</div>
        <RowValue color={color}>{value}</RowValue>
      </Row>
      {subLabel && <SubLabel>{subLabel}</SubLabel>}
    </Column>
  )
}
