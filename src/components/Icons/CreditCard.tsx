import React from 'react'

import { useTheme } from 'styled-components'

export default function CreditCard({ size, ...rest }: { size: number; [x: string]: any }) {
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
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  )
}
