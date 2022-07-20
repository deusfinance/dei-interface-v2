import React from 'react'
import { useTheme } from 'styled-components'

export default function NavToggle({ ...rest }: { [x: string]: any }) {
  const theme = useTheme()
  return (
    <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path d="M1 1H23" stroke={theme.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 6.5H23" stroke={theme.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 12.5H23" stroke={theme.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
