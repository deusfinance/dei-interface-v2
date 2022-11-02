import React from 'react'
import styled from 'styled-components'

import { RowBetween, RowEnd, RowStart } from 'components/Row'

const Wrapper = styled.div`
  gap: 12px;
  width: 100%;
  display: flex;
  padding: 10px;
  flex-direction: column;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid;
`

const Title = styled(RowStart)`
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
`

const Value = styled(RowEnd)`
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
`

export default function ModalInfo({ info }: { info: { title: string; value: string }[] }) {
  return (
    <Wrapper>
      {info.map((info, index) => {
        return (
          <RowBetween key={index}>
            <Title>{info.title}</Title>
            <Value>{info.value}</Value>
          </RowBetween>
        )
      })}
    </Wrapper>
  )
}
