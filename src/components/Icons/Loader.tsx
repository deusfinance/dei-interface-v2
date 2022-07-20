import React from 'react'
import styled, { keyframes, useTheme } from 'styled-components'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const StyledSVG = styled.svg<{
  duration: string
  size: string
}>`
  animation: ${({ duration }) => duration} ${rotate} linear infinite;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
`

export default function Loader({
  size = '16px',
  stroke,
  duration = '2s',
  ...rest
}: {
  size?: string
  stroke?: string
  duration?: string
  [x: string]: any
}) {
  const theme = useTheme()
  const color = stroke ?? theme.text2

  return (
    <StyledSVG size={size} viewBox="0 0 24 24" fill="none" stroke={color} duration={duration} {...rest}>
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
      />
    </StyledSVG>
  )
}
