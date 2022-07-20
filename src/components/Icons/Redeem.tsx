import React from 'react'

import { useTheme } from 'styled-components'

export default function Redeem({ size = 8, ...rest }: { size?: number; [x: string]: any }) {
  const theme = useTheme()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={theme.text1}
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M12 23a7.5 7.5 0 0 1-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.773.5 1.604.5 2.47A7.5 7.5 0 0 1 12 23z" />
    </svg>
  )
}
