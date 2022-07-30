import { Row } from 'components/Row'
import React from 'react'
import styled from 'styled-components'
import StatsItem from './StatsItem'

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 12px;
  /* width: 100%; */
  /* height: 457px; */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 38px 36px 38px 36px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`

const Chart = styled.div`
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 12px;
  width: 100%;
  min-width: 200px;
  min-height: 200px;
`

const AllStats = styled.div`
  width: 100%;
`

const StatsWrapper = styled.div`
  display: block;
`

const Items = styled(Row)`
  display: flex;
  flex-direction: column;
  & > * {
    margin-top: 16px;
  }
`

const Info = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex: 1;
  margin: 20px 10px;
`

const Title = styled.div`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 20px;
  color: ${({ theme }) => theme.text1};
`

export default function Stats() {
  return (
    <Wrapper>
      <AllStats>
        <StatsWrapper>
          <Title>DEI Stats</Title>
          <Items>
            <Info>
              <StatsItem name="DEI Price" value="$1.00" rightBorder={true} />
              <StatsItem name="Total Supply" value="21.01m" rightBorder={true} />
              <StatsItem name="Total Protocol Holdings" value="0m" />
            </Info>
            <Info>
              <StatsItem name="Circulating Supply" value="21.01" rightBorder={true} />
              <StatsItem name="Total Reserve Assets" value="21.01" rightBorder={true} />
              <StatsItem name="USDC Baking Per DEI" value="91%" />
            </Info>
          </Items>
        </StatsWrapper>
        <StatsWrapper>
          <Title>DEUS Stats</Title>
          <Items>
            <Info>
              <StatsItem name="DEUS Price" value="128$" rightBorder={true} />
              <StatsItem name="Total Supply" value="21.01" rightBorder={true} />
              <StatsItem name="Market Cap" value="0m" />
            </Info>
            <Info>
              <StatsItem name="veDEUS Supplu" value="21.01m" rightBorder={true} />
            </Info>
          </Items>
        </StatsWrapper>
      </AllStats>
      <Chart>Chart</Chart>
    </Wrapper>
  )
}
