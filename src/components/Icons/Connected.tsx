import React from 'react'

export default function Connected({ size = 8, ...rest }: { size?: number; [x: string]: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" {...rest}>
      <circle cx="4" cy="4" r="4" fill="#00E376" />
    </svg>
  )
}
