import React from 'react'

export default function Staking({ size, ...rest }: { size: number; [x: string]: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x="0.600061" y="0.6" width="16.8" height="16.8" rx="1.4" stroke="#EBEBEC" />
      <rect x="4.00006" y="13.6001" width="10" height="1.6" rx="0.2" fill="#EBEBEC" />
      <rect x="3.50006" y="11.2998" width="10" height="1.6" rx="0.2" fill="#EBEBEC" />
      <rect x="4.50006" y="9" width="10" height="1.6" rx="0.2" fill="#EBEBEC" />
    </svg>
  )
}
