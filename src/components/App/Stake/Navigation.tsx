import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 20px;
  margin-left: 30px;
`

const Item = styled.div<{ selected: boolean; fontSize?: string }>`
  font-size: ${({ fontSize }) => (fontSize ? fontSize : '15px')};
  transition: all 0.3s ease;
  border-bottom: 1px solid ${({ selected, theme }) => (selected ? theme.text1 : 'transparent')};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  &:hover {
    cursor: pointer;
  }
`

export enum NavigationTypes {
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
}

const NavigationLabels = {
  [NavigationTypes.STAKE]: 'Stake',
  [NavigationTypes.UNSTAKE]: 'Unstake',
}

export default function Navigation({
  selected,
  setSelected,
  fontSize,
}: {
  selected: string
  setSelected: (value: NavigationTypes) => void
  fontSize?: string
}) {
  return (
    <Wrapper>
      {(Object.keys(NavigationTypes) as Array<keyof typeof NavigationTypes>).map((key, index) => {
        const label = NavigationLabels[key]
        return (
          <Item
            fontSize={fontSize}
            selected={key == selected}
            onClick={() => setSelected(NavigationTypes[key])}
            key={index}
          >
            {label}
          </Item>
        )
      })}
    </Wrapper>
  )
}
