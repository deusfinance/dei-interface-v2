import React from 'react'
import styled from 'styled-components'

import { usePoolBalances } from 'hooks/useStablePoolInfo'
import { formatDollarAmount } from 'utils/numbers'
import { LiquidityType, Stakings } from 'constants/stakingPools'
import Copy from 'components/Copy'
import { truncateAddress } from 'utils/address'

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text2};
  border: 1px solid ${({ theme }) => theme.bg0};
  white-space: nowrap;
  gap: 10px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 20px;
  position: relative;
  z-index: 1;
  width: 400px;
  margin-top: 50px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 12px 0;
    padding: 0.5rem;
  `}

  &>* {
    margin-bottom: 10px;
  }
`

const Column = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`

const Title = styled.span`
  font-size: 24px;
  font-weight: 900;
  font-family: 'Space Grotesk';
  color: ${({ theme }) => theme.text1};
`

const Col = styled(Column)`
  color: ${({ theme }) => theme.text1};
  font-size: 20px;
`

const Col2 = styled(Column)`
  margin-top: 10px;
  font-size: 16px;
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

const RightTitle = styled.div<{ disabled?: boolean }>`
  color: ${({ theme, disabled }) => (disabled ? theme.text2 : theme.text1)};
`

export default function PoolInfo({ pool }: { pool: LiquidityType }) {
  // const { poolInfo, virtualPrice, APrice, paused } = useGlobalSyncPoolDate(pool)
  // const [adminFee, swapFee] = poolInfo
  const poolBalances = usePoolBalances(pool).reduce((a, b) => a + b, 0)
  const stakingPool = Stakings.find((p) => p.id === pool.id) || Stakings[0]
  const active = stakingPool?.active

  return (
    <Wrapper>
      <Col>
        <Title>
          {stakingPool.name}
          <Circle disabled={!active}></Circle>
        </Title>
        <RightTitle disabled> 0.00% of Pool </RightTitle>
      </Col>

      <Col2>
        <div> APR: </div>
        <RightTitle> N/A </RightTitle>
      </Col2>

      <Col2>
        <div> Total Locked: </div>
        <RightTitle> {formatDollarAmount(poolBalances)} </RightTitle>
      </Col2>

      <Col2>
        <div> Fee: </div>
        <RightTitle> N/A </RightTitle>
      </Col2>

      <Col2>
        <div> Virtual Price: </div>
        <RightTitle> N/A </RightTitle>
      </Col2>

      <Col2>
        <div> Total Reserve Value: </div>
        <RightTitle> N/A </RightTitle>
      </Col2>

      <Col2>
        <div> {pool.tokens[0].symbol} Reserve: </div>
        <RightTitle> N/A </RightTitle>
      </Col2>

      <Col2>
        <div> {pool.tokens[1].symbol} Reserve: </div>
        <RightTitle> N/A </RightTitle>
      </Col2>

      <Col2>
        <div> Pool Address: </div>
        <RightTitle>
          {pool?.contract && <Copy toCopy={pool?.contract} text={truncateAddress(pool?.contract)} />}
        </RightTitle>
      </Col2>

      <Col2>
        <div> LP Token Address: </div>
        <RightTitle>
          {pool?.lpToken.address && (
            <Copy toCopy={pool?.lpToken.address} text={truncateAddress(pool?.lpToken.address)} />
          )}
        </RightTitle>
      </Col2>
    </Wrapper>
  )
}
