import React from 'react'

import { useTheme } from 'styled-components'

export default function Markets({ size, ...rest }: { size: number; [x: string]: any }) {
  const theme = useTheme()

  return (
    <svg
      width={size}
      height={size / 1.5}
      viewBox="0 0 16 11"
      fill={theme.text1}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M0 11V9.77778H10.2857V11H0ZM0 4.88889H16V6.11111H0V4.88889ZM12.5714 0V1.22222H0V0H12.5714Z"
        fill={theme.text1}
      />
    </svg>
  )
}
