import React, { useMemo } from 'react'
import styled from 'styled-components'

import { usePoolBalances, usePoolInfo } from 'hooks/useStablePoolInfo'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { LiquidityType, StakingType, Stakings } from 'constants/stakingPools'
import Copy from 'components/Copy'
import { truncateAddress } from 'utils/address'
import Container from './common/Container'
import { ContentTable, Label, TableHeader, Value, VStack } from './common/Layout'
import { useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'

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

const PoolBalance = React.memo(({ pool, totalLocked }: { pool: LiquidityType; totalLocked: number }) => {
  return (
    <ContentTable>
      <Label> Total Locked: </Label>
      <Value> {formatAmount(totalLocked)} </Value>
    </ContentTable>
  )
})
PoolBalance.displayName = 'PoolBalance'

export const APR = React.memo(({ stakingPool }: { stakingPool: StakingType }) => {
  const apr = stakingPool.aprHook(stakingPool)
  return (
    <ContentTable>
      <Label>APR:</Label>
      <Value> {apr.toFixed(0)}% </Value>
    </ContentTable>
  )
})
APR.displayName = 'APR'

export default function PoolInfo({ pool }: { pool: LiquidityType }) {
  const stakingPool = Stakings.find((p) => p.id === pool.id) || Stakings[0]
  const active = stakingPool?.active
  const deusPrice = useDeusPrice()
  const deiPrice = useDeiPrice()

  const poolBalances = usePoolBalances(pool)
  const totalLocked = poolBalances?.reduce((a, b) => a + b, 0)
  const poolInfo = usePoolInfo(pool)

  const totalLockedValue = useMemo(() => {
    return poolBalances[1] * 2 * Number(stakingPool.name === 'DEI-bDEI' ? deiPrice : deusPrice)
  }, [deiPrice, deusPrice, poolBalances, stakingPool.name])

  return (
    <Container>
      <Wrapper>
        <TableHeader>
          <p>
            {stakingPool.name}
            <Circle disabled={!active}></Circle>
          </p>
        </TableHeader>
        <APR stakingPool={stakingPool} />
        <PoolBalance pool={pool} totalLocked={totalLocked} />
        <ContentTable>
          <Label> Fee: </Label>
          <Value> {formatAmount(poolInfo?.protocolFee)} </Value>
        </ContentTable>

        <ContentTable>
          <Label> Virtual Price: </Label>
          <Value> {formatDollarAmount(poolInfo?.virtualPrice)} </Value>
        </ContentTable>

        <ContentTable>
          <Label> Total Reserve Value: </Label>
          <Value> {formatDollarAmount(totalLockedValue)} </Value>
        </ContentTable>

        <ContentTable>
          <Label> {pool.tokens[0].symbol} Reserve: </Label>
          <Value> {formatAmount(poolBalances[1])} </Value>
        </ContentTable>

        {pool?.tokens[1] && (
          <ContentTable>
            <Label> {pool.tokens[1].symbol} Reserve: </Label>
            <Value> {formatAmount(poolBalances[0])} </Value>
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
            <Label> LP Token Address: </Label>
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
