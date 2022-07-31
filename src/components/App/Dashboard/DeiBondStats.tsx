import React from 'react'

import { Row, RowStart } from 'components/Row'
import styled from 'styled-components'
import StatsItem from './StatsItem'

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 12px;
  padding: 20px;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `};
`

const DeiStats = styled(Row)`
  white-space: nowrap;
  flex-direction: column;
  /* width: 40%; */

  & > * {
    margin: 2px auto;
  }
`

const DeiInfo = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  white-space: nowrap;
  margin-top: 9px;
  & > * {
    &:nth-child(4) {
      border-right: none;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-wrap: wrap;
    margin-top:unset;
    margin-left:-10px;
    & > * {
        margin-top:14px;
        &:nth-child(2n){
            border-right:none
        }
    }
  `};
`

const Title = styled(RowStart)`
  font-family: 'IBM Plex Mono';
  font-weight: 400;
  font-size: 20px;
  color: ${({ theme }) => theme.text1};
  margin-bottom: 10px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 16px;

  `};
`

const ClaimedDei = styled(RowStart)`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`

const ClaimedValue = styled.div`
  font-family: 'IBM Plex Mono';
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-left: 13px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size:10px;
    margin-left:4px;
  `};
`

export default function DeiBondStats() {
  return (
    <Wrapper>
      <DeiStats>
        <Title>Your DEI Bond stats</Title>
        <ClaimedDei>
          Total Dei Claimed: <ClaimedValue>12m</ClaimedValue>
        </ClaimedDei>
      </DeiStats>
      <DeiInfo>
        <StatsItem name="Your bDEI balance" value="$1.00?" />
        <StatsItem name="Your NFT value" value="$1.00?" />
        <StatsItem name="Your NFT maturity" value="$1.00?" />
        <StatsItem name="Your DEI claimable" value="$1.00?s" />
      </DeiInfo>
    </Wrapper>
  )
}
