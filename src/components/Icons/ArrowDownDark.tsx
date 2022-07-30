import React from 'react'

export default function ArrowDownDark({ size, ...rest }: { size: number; [x: string]: any }) {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M8.6723 14.7071L16 7.00003L14.6554 5.58582L8.9508 11.5858L8.9508 8.31192e-08L7.04926 0L7.04926 11.5858L1.34459 5.58581L0 7.00003L7.3277 14.7071C7.699 15.0977 8.301 15.0977 8.6723 14.7071Z"
        fill="#EBEBEC"
      />
    </svg>
  )
}
