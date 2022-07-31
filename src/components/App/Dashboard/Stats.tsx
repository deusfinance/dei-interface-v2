import React from 'react'
import styled from 'styled-components'

import StatsItem from './StatsItem'
import Chart from './Chart'
import { RowBetween } from 'components/Row'

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
`

const AllStats = styled.div`
  width: 100%;
  & > * {
    &:nth-child(2) {
      margin-top: 30px;
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
  flex-wrap: wrap;
  & > * {
    margin-top: 10px;
    &:nth-child(3n) {
      border-right: none;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin:unset;
    // margin-left:-10px;
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
  background: ${({ theme }) => theme.specialBG1};
  margin-left: 20px;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const DeusTitle = styled(Title)`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export default function Stats() {
  return (
    <Wrapper>
      <AllStats>
        <StatsWrapper>
          <Title>DEI Stats</Title>
          <Info>
            <StatsItem name="DEI Price" value="$1.00" linkIcon={true} />
            <StatsItem name="Total Supply" value="21.01m" linkIcon={true} />
            <StatsItem name="Total Protocol Holdings" value="0m" linkIcon={true} />
            <StatsItem name="Circulating Supply" value="21.01" linkIcon={true} />
            <StatsItem name="Total Reserve Assets" value="21.01" linkIcon={true} />
            <StatsItem name="USDC Baking Per DEI" value="91%" linkIcon={true} />
          </Info>
        </StatsWrapper>
        <StatsWrapper>
          <DeusTitle>DEUS Stats</DeusTitle>
          <Info>
            <StatsItem name="DEUS Price" value="128$" linkIcon={true} />
            <StatsItem name="Total Supply" value="21.01" linkIcon={true} />
            <StatsItem name="Market Cap" value="0m" linkIcon={true} />
            <StatsItem name="veDEUS Supplu" value="21.01m" linkIcon={true} />
          </Info>
        </StatsWrapper>
      </AllStats>
      <ChartWrapper>
        <Chart />
      </ChartWrapper>
    </Wrapper>
  )
}
