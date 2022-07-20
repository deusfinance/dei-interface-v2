import React from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

const Circle = styled.div<{
  size: number
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: ${({ size }) => size + 'px'};
  height: ${({ size }) => size + 'px'};
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`

export default function ArrowBubble({ size = 30, ...rest }: { size?: number; [x: string]: any }) {
  return (
    <Circle size={size} {...rest}>
      <ArrowDown size={size / 1.5} />
    </Circle>
  )
}
