import React from 'react'
import styled from 'styled-components'

const data = [
  '1 DEUS locked for 4 years = 1.00 veDEUS',
  '1 DEUS locked for 3 years = 0.75 veDEUS',
  '1 DEUS locked for 2 years = 0.50 veDEUS',
  '1 DEUS locked for 1 years = 0.25 veDEUS',
]

const Wrap = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border1};
  padding-top: 15px;
`

const Text = styled.div`
  font-style: italic;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text2};
`

export default function GeneralLockInformation() {
  return (
    <Wrap>
      {data.map((text, index) => (
        <Text key={index}>{text}</Text>
      ))}
    </Wrap>
  )
}
