import { Row } from 'components/Row'
import React from 'react'
import styled from 'styled-components'

const Wrapper = styled(Row)`
  flex-direction: row;
  width: 50%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    // TODO : add style for mobile
    // flex-direction: column;
  `}
`

const Item = styled(Row)<{ rightBorder?: boolean }>`
  flex-direction: column;
  padding-right: 24px;
  padding-left: 24px;
  border-right: ${({ theme, rightBorder }) => (rightBorder ? `1px solid ${theme.border1}` : 'unset')}; ;
`

const Name = styled.div`
  /* font-family: 'Inter'; */
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
`

const Value = styled.div`
  /* font-family: 'IBM Plex Mono'; */
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
`

export default function DashboardHeader({ items }: { items: { name: string; value: string }[] }) {
  return (
    <Wrapper>
      {items.map((item, index) => (
        <Item key={index} rightBorder={index < items.length - 1}>
          <Name>{item.name}</Name>
          <Value>{item.value}</Value>
        </Item>
      ))}
    </Wrapper>
  )
}
