import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
`

const Item = styled.div<{ selected: boolean }>`
  font-size: 15px;
  transition: all 0.3s ease;
  text-align: center;
  padding: 12px;
  margin: 6px auto;
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text2)};
  width: 50%;

  &:hover {
    cursor: pointer;
  }
`

const Line = styled.div`
  margin-top: 10px;
  width: 2px;
  height: 35px;
  background: ${({ theme }) => theme.bg2};
`

export enum ActionTypes {
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
}

const ActionLabels = {
  [ActionTypes.STAKE]: 'Stake',
  [ActionTypes.UNSTAKE]: 'Unstake',
}

export default function ActionSetter({
  selected,
  setSelected,
}: {
  selected: string
  setSelected: (value: ActionTypes) => void
}) {
  return (
    <Wrapper>
      {(Object.keys(ActionTypes) as Array<keyof typeof ActionTypes>).map((key, index) => {
        const label = ActionLabels[key]
        return (
          <React.Fragment key={index}>
            <Item selected={key == selected} onClick={() => setSelected(ActionTypes[key])} key={index}>
              {label}
            </Item>
            {index === 0 && <Line />}
          </React.Fragment>
        )
      })}
    </Wrapper>
  )
}
