import React from 'react'
import styled from 'styled-components'

import Box from 'components/Box'

const StyledBox = styled(Box)`
  flex-flow: column nowrap;
  padding: 10px;
  width: fit-content;
  align-items: start;
`

const Title = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text1};

  & > span {
    font-size: 0.8rem;
  }
`

const MajorValue = styled.div`
  color: ${({ theme }) => theme.text2};
  font-size: 1.5rem;
`

export function Deposits() {
  return (
    <StyledBox>
      <Title>Total Deposits</Title>
      <MajorValue>0.00</MajorValue>
    </StyledBox>
  )
}

export function Claimable() {
  return (
    <StyledBox>
      <Title>Claimable Rewards</Title>
      <MajorValue>0.00</MajorValue>
    </StyledBox>
  )
}

export function Balance() {
  return (
    <StyledBox>
      <Title>
        SOLID<span>fluid</span> Balance
      </Title>
      <MajorValue>0.00</MajorValue>
    </StyledBox>
  )
}
