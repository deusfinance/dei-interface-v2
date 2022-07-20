import React from 'react'

import { useTheme } from 'styled-components'

export default function Droplet({ size, ...rest }: { size: number; [x: string]: any }) {
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
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
  )
}
