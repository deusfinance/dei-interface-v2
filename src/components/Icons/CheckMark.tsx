import React from 'react'

export default function CheckMark({
  size = 12,
  color = '#00E376',
  ...rest
}: {
  size?: number
  color?: string
  [x: string]: any
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        stroke={color}
        d="M11.8047 0.202772C12.0651 0.473135 12.0651 0.91148 11.8047 1.18184L4.4714 8.79723C4.21105 9.06759 3.78895 9.06759 3.5286 8.79723L0.195262 5.33569C-0.0650874 5.06533 -0.0650874 4.62698 0.195262 4.35662C0.455612 4.08626 0.877722 4.08626 1.13807 4.35662L4 7.32862L10.8619 0.202772C11.1223 -0.0675907 11.5444 -0.0675907 11.8047 0.202772Z"
        fill="#EBEBEC"
      />
    </svg>
  )
}
