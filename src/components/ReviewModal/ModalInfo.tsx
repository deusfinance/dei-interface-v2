import { RowBetween, RowEnd, RowStart } from 'components/Row'
import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  flex-direction: column;
  justify-content: center;
  margin: 10px 15px;
`

const Title = styled(RowStart)`
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.text2};
`

const Value = styled(RowEnd)`
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.text1};
`

export default function ModalInfo({ info }: { info: { title: string; value: string }[] }) {
  return (
    <Wrapper>
      {info.map((info, index) => {
        return (
          <RowBetween key={index}>
            <Title>{info.title}:</Title>
            <Value>{info.value}</Value>
          </RowBetween>
        )
      })}
    </Wrapper>
  )
}
