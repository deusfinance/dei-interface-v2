import React from 'react'

export default function NavToggle({ ...rest }: { [x: string]: any }) {
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect width={36} height={36} rx={8} fill="#202229" />
      <rect x="0.5" y="0.5" width={35} height={35} rx="7.5" stroke="#EBEBEC" />
      <rect x={8} y={11} width={20} height={2} rx={1} fill="#EBEBEC" />
      <rect x={8} y={17} width={20} height={2} rx={1} fill="#EBEBEC" />
      <rect x={8} y={23} width={20} height={2} rx={1} fill="#EBEBEC" />
    </svg>
  )
}
