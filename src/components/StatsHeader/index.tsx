import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  margin-top: 18px;
  -webkit-overflow-scrolling: touch;
`

const Item = styled.div<{ rightBorder?: boolean }>`
  display: inline-block;
  padding: 0 24px;
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

export default function StatsHeader({ items }: { items: { name: string; value: string }[] }) {
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
