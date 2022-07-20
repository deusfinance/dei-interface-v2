import React from 'react'

import { useTheme } from 'styled-components'

export default function Lock({ size, ...rest }: { size: number; [x: string]: any }) {
  const theme = useTheme()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={theme.text1}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  )
}
