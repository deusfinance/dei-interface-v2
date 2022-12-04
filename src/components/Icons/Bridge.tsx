import React from 'react'

export default function Bridge({ size, ...rest }: { size: number; [x: string]: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99998 1.6C12.2757 1.6 14.2227 3.00778 15.0175 5H4.98245C5.77726 3.00778 7.72422 1.6 9.99998 1.6ZM3.28986 5C4.1504 2.10851 6.82896 0 9.99998 0C13.171 0 15.8495 2.10851 16.7101 5H17.5H19H20V6.6H19V10.5V12H17.5H16.7083C15.0604 10.1588 12.6655 9 10 9C7.3345 9 4.93964 10.1588 3.29168 12H2.5H1V10.5V6.6H0V5H1H2.5H3.28986ZM17.5 6.6H2.5V10.5H2.65156C4.54391 8.64588 7.13898 7.5 10 7.5C12.861 7.5 15.4561 8.64588 17.3484 10.5H17.5V6.6Z"
        fill="#EBEBEC"
      />
    </svg>
  )
}
