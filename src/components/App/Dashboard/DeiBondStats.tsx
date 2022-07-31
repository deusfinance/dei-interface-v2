import React from 'react'

import { RowBetween, RowEnd } from 'components/Row'
import styled from 'styled-components'
import StatsItem from './StatsItem'

const Wrapper = styled(RowBetween)`
  border-radius: 12px;
  padding: 20px;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    align-items: flex-start;
    padding-left: 0;
  `};
`

const DeiStats = styled.div`
  white-space: nowrap;

  & > * {
    margin: 2px auto;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
      margin-left: 11px;
  `};
`

const DeiInfo = styled(RowEnd)`
  width: 100%;
  white-space: nowrap;
  margin-top: 9px;
  & > * {
    width: unset;
    min-width: unset;
    &:nth-child(4) {
      border-right: none;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top:unset;
    flex-wrap:wrap;
    & > * {
      width: 50%;
        margin-top:14px;
        &:nth-child(2n){
            border-right:none
        }
    }
  `};
`

const Title = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.text1};
  margin-bottom: 10px;
  text-align: left;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 16px;

  `};
`

const ClaimedDei = styled.div`
  font-family: 'Inter';
  font-size: 12px;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 10px;
  `};
`

const ClaimedValue = styled.span`
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
