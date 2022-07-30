import React from 'react'

export default function Link({
  size = 8,
  color = '#EBEBEC',
  ...rest
}: {
  size?: number
  color?: string
  [x: string]: any
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M7.33783 6.72068e-05L0.0188049 0.102548L0 1.44555L5.69785 1.36577L0.119622 6.944L1.05597 7.88035L6.63423 2.30209L6.55445 8L7.89745 7.98119L7.99993 0.662166C8.00513 0.291306 7.70869 -0.00512604 7.33783 6.72068e-05Z"
        fill={color}
      />
    </svg>
  )
}
