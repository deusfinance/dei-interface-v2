import React, { useMemo } from 'react'
import styled from 'styled-components'

import { truncateAddress } from 'utils/address'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { LiquidityType, Stakings } from 'constants/stakingPools'
import { useDeiPrice, useDeusPrice } from 'state/dashboard/hooks'

import { usePoolBalances, usePoolInfo } from 'hooks/useStablePoolInfo'
import { useUserInfo } from 'hooks/useStakingInfo'
import { useBDeiStats } from 'hooks/useBDeiStats'
import { useXDeusStats } from 'hooks/useXDeusStats'

import Copy from 'components/Copy'

import Container from './common/Container'
import { ContentTable, Label, TableHeader, Value, VStack } from './common/Layout'

const Wrapper = styled(VStack)`
  padding: 12px;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 12px;
`

const Circle = styled.div<{ disabled: boolean }>`
  display: inline-block;
  margin-left: 8px;
  margin-bottom: 2px;
  background: ${({ theme, disabled }) => (disabled ? theme.red1 : theme.green1)};
  border-radius: 50%;
  width: 10px;
  height: 10px;
`

const PoolBalance = React.memo(({ totalLocked }: { totalLocked: number }) => {
  return (
    <ContentTable>
      <Label> Total Locked: </Label>
      <Value> {formatAmount(totalLocked)} </Value>
    </ContentTable>
  )
})
PoolBalance.displayName = 'PoolBalance'

// export const APR = React.memo(
//   ({ stakingPool, liquidityPool }: { stakingPool: StakingType; liquidityPool: LiquidityType }) => {
//     const deusAPY = useGetDeusApy(liquidityPool, stakingPool)
//     // generate total APR if pools have secondary APRs
//     const primaryApy = stakingPool.aprHook(stakingPool)
//     const secondaryApy = stakingPool.id === 2 ? deusAPY : 0
//     const apr = primaryApy + secondaryApy
//     return (
//       <ContentTable>
//         <Label>APR:</Label>
//         <Value> {apr.toFixed(0)}% </Value>
//       </ContentTable>
//     )
//   }
// )
// APR.displayName = 'APR'

export default function PoolInfo({ pool }: { pool: LiquidityType }) {
  const stakingPool = Stakings.find((p) => p.id === pool.id) || Stakings[0]
  const active = stakingPool?.active
  const deusPrice = useDeusPrice()
  const deiPrice = useDeiPrice()

  const poolBalances = usePoolBalances(pool)
  const totalLocked = poolBalances?.reduce((a, b) => a + b, 0)
  const poolInfo = usePoolInfo(pool)

  const { totalDepositedAmount } = useUserInfo(stakingPool)

  const isSingleStakingPool = useMemo(() => {
    return stakingPool.isSingleStaking
  }, [stakingPool])

  const { swapRatio: xDeusRatio } = useXDeusStats()
  const { swapRatio: bDeiRatio } = useBDeiStats()

  const totalDepositedValue = useMemo(() => {
    return stakingPool.id === 0
      ? totalDepositedAmount * bDeiRatio * parseFloat(deiPrice)
      : totalDepositedAmount * xDeusRatio * parseFloat(deusPrice)
  }, [bDeiRatio, deiPrice, deusPrice, stakingPool, totalDepositedAmount, xDeusRatio])

  const totalLockedValue = useMemo(() => {
    return stakingPool.id > 3 ? 0 : poolBalances[1] * 2 * Number(stakingPool.name === 'DEI-bDEI' ? deiPrice : deusPrice)
  }, [deiPrice, deusPrice, poolBalances, stakingPool])

  // generate total APR if pools have secondary APRs
  const primaryApy = stakingPool.aprHook(stakingPool)
  const secondaryApy = stakingPool.secondaryAprHook(pool, stakingPool)
  const apr = primaryApy + secondaryApy

  return (
    <Container>
      <Wrapper>
        <TableHeader>
          <p>
            {stakingPool.name}
            <Circle disabled={!active}></Circle>
          </p>
        </TableHeader>
        <ContentTable>
          <Label>APR:</Label>
          <Value> {apr.toFixed(0)}% </Value>
        </ContentTable>
        <PoolBalance totalLocked={isSingleStakingPool ? totalDepositedAmount : totalLocked} />

        {!isSingleStakingPool ? (
          <ContentTable>
            <Label> Swap Fee: </Label>
            <Value>{formatAmount(poolInfo?.swapFee)} %</Value>
          </ContentTable>
        ) : null}

        {!isSingleStakingPool ? (
          <ContentTable>
            <Label> Virtual Price: </Label>
            <Value>{formatAmount(poolInfo?.virtualPrice)}</Value>
          </ContentTable>
        ) : null}

        <ContentTable>
          <Label> Total Reserve Value: </Label>
          <Value>
            {isSingleStakingPool ? formatAmount(totalDepositedValue) : formatDollarAmount(totalLockedValue)}
          </Value>
        </ContentTable>

        <ContentTable>
          <Label> {pool.tokens[0].symbol} Reserve: </Label>
          <Value> {isSingleStakingPool ? formatAmount(totalDepositedAmount) : formatAmount(poolBalances[0])} </Value>
        </ContentTable>

        {!isSingleStakingPool && (
          <ContentTable>
            <Label> {pool.tokens[1].symbol} Reserve: </Label>
            <Value> {formatAmount(poolBalances[1])} </Value>
          </ContentTable>
        )}

        {pool?.contract && (
          <ContentTable>
            <Label> Pool Address: </Label>
            <Value>
              <p style={{ textDecoration: 'underline' }}>
                {<Copy toCopy={pool?.contract} text={truncateAddress(pool?.contract)} />}
              </p>
            </Value>
          </ContentTable>
        )}

        {pool?.lpToken.address && (
          <ContentTable>
            <Label>{pool?.lpToken.symbol} Token Address: </Label>
            <Value>
              <p style={{ textDecoration: 'underline' }}>
                {<Copy toCopy={pool?.lpToken.address} text={truncateAddress(pool?.lpToken.address)} />}
              </p>
            </Value>
          </ContentTable>
        )}
      </Wrapper>
    </Container>
  )
}
