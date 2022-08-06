import React, { useMemo } from 'react'
import styled from 'styled-components'

import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useDeiStats } from 'hooks/useDeiStats'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { RowBetween } from 'components/Row'
import StatsItem from './StatsItem'
import Chart from './Chart'

const Wrapper = styled(RowBetween)`
  background: ${({ theme }) => theme.bg0};
  align-items: stretch;
  border-radius: 12px;
  padding: 38px 36px;
  padding-left: 14px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `};
`

const ChartWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 12px;
  width: 100%;
  min-width: 200px;
  min-height: 200px;
  margin-left: 15px;
`

const AllStats = styled.div`
  width: 100%;
  & > * {
    &:nth-child(2) {
      margin-top: 36px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom:25px;
  `};
`

const StatsWrapper = styled.div`
  display: block;
`

const Info = styled(RowBetween)`
  width: 100%;
  /* margin: 20px -24px; */

  gap: 16px 0;
  flex-wrap: wrap;
  & > * {
    margin-top: 16px;
    &:nth-child(3n) {
      border-right: none;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin:unset;
      & > * {
      &:nth-child(3n) {
        border-right: 1px solid ${({ theme }) => theme.border1};
      }
      &:nth-child(2n) {
        border-right: none;
      }
    }
  `};
`

const Title = styled.span`
  font-family: 'Inter';
  font-size: 20px;
  margin-left: 22px;
  background: ${({ theme }) => theme.specialBG1};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left:11px;
  `};
`

const DeusTitle = styled(Title)`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export default function Stats() {
  const deusPrice = useDeusPrice()
  const { totalSupply, totalProtocolHoldings, circulatingSupply, totalUSDCReserves } = useDeiStats()

  const usdcBackingPerDei = useMemo(() => {
    return (totalUSDCReserves / circulatingSupply) * 100
  }, [totalUSDCReserves, circulatingSupply])

  return (
    <Wrapper>
      <AllStats>
        <StatsWrapper>
          <Title>DEI Stats</Title>
          <Info>
            <StatsItem name="DEI Price" value={'$1.00'} linkIcon={true} />
            <StatsItem name="Total Supply" value={formatDollarAmount(totalSupply, 2)} linkIcon={true} />
            <StatsItem
              name="Total Protocol Holdings"
              value={formatDollarAmount(totalProtocolHoldings, 2)}
              linkIcon={true}
            />
            <StatsItem name="Circulating Supply" value={formatDollarAmount(circulatingSupply, 2)} linkIcon={true} />
            <StatsItem name="Total Reserve Assets" value={formatDollarAmount(totalUSDCReserves, 2)} linkIcon={true} />
            <StatsItem
              name="USDC Baking Per DEI"
              value={formatAmount(usdcBackingPerDei, 1).toString() + '%'}
              linkIcon={true}
            />
          </Info>
        </StatsWrapper>
        <StatsWrapper>
          <DeusTitle>DEUS Stats</DeusTitle>
          <Info>
            <StatsItem name="DEUS Price" value={formatDollarAmount(parseFloat(deusPrice), 2)} linkIcon={true} />
            <StatsItem name="Total Supply" value="-" linkIcon={true} />
            <StatsItem name="Market Cap" value="-" linkIcon={true} />
            <StatsItem name="veDEUS Supply" value="-" linkIcon={true} />
          </Info>
        </StatsWrapper>
      </AllStats>
      <ChartWrapper>
        <Chart />
      </ChartWrapper>
    </Wrapper>
  )
}
