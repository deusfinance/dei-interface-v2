import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: green;
    border-radius: 50%;
  }
`

export default function GreenCircle() {
  return (
    <Wrapper>
      <div />
    </Wrapper>
  )
}
