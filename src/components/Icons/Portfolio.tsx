import React from 'react'

import { useTheme } from 'styled-components'

export default function Portfolio({ size, ...rest }: { size: number; [x: string]: any }) {
  const theme = useTheme()

  return (
    <svg
      width={size}
      height={size / 1.3}
      viewBox="0 0 18 14"
      fill={theme.text1}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M11.2857 3C11.2857 3 11.2857 1 9 1C6.71429 1 6.71429 3 6.71429 3M16.4286 7.5V13H1.57143V7.5H16.4286ZM1 3H17V7C17 7 13.5714 9 9 9C4.42857 9 1 7 1 7V3ZM9 10V8V10Z"
        stroke={theme.text2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
