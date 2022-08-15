import React from 'react'

export default function VeDeus({ size, ...rest }: { size: number; [x: string]: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.93529 1.05042C2.16934 0.416004 2.73604 0 3.36624 0H16.6338C17.264 0 17.8307 0.416004 18.0647 1.05043L19.8897 5.9974C20.1128 6.60198 19.9916 7.29197 19.5792 7.76537L11.1205 17.4763C10.5123 18.1746 9.48773 18.1746 8.87954 17.4763L0.420758 7.76537C0.00840289 7.29197 -0.112774 6.60198 0.110266 5.9974L1.93529 1.05042ZM16.6338 1.67103L3.36624 1.67103L1.54122 6.618L10 16.329L18.4588 6.618L16.6338 1.67103Z"
        fill="#EBEBEC"
      />
    </svg>
  )
}
