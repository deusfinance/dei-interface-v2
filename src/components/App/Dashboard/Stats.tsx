import React from 'react'
import styled from 'styled-components'

import StatsItem from './StatsItem'
import Chart from './Chart'

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 38px 36px 38px 36px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
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

const Info = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 20px -24px;
  flex-wrap: wrap;
  & > * {
    margin-top: 10px;
    &:nth-child(3n) {
      border-right: none;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin:unset;
    margin-left:-10px;
      & > * {
      &:nth-child(2n) {
        border-right: none;
      }
    }
  `};
`

const Title = styled.span`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 20px;
  background: ${({ theme }) => theme.specialBG1};
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
