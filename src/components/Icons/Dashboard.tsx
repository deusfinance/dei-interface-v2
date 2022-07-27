import React from 'react'

import { useTheme } from 'styled-components'

export default function Dashboard({ size, ...rest }: { size: number; [x: string]: any }) {
  const theme = useTheme()

  return (
    <svg width={size} height={size} viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.9091 14.4H17.2727C18.779 14.4 20 13.1912 20 11.7V2.7C20 1.20883 18.779 0 17.2727 0H2.72727C1.22104 0 0 1.20883 0 2.7V11.7C0 13.1912 1.22104 14.4 2.72727 14.4H9.09091V16.2H6.36364C5.86156 16.2 5.45455 16.6029 5.45455 17.1C5.45455 17.5971 5.86156 18 6.36364 18H13.6364C14.1384 18 14.5455 17.5971 14.5455 17.1C14.5455 16.6029 14.1384 16.2 13.6364 16.2H10.9091V14.4ZM2.72727 1.8C2.2252 1.8 1.81818 2.20294 1.81818 2.7V11.7C1.81818 12.1971 2.2252 12.6 2.72727 12.6H17.2727C17.7748 12.6 18.1818 12.1971 18.1818 11.7V2.7C18.1818 2.20294 17.7748 1.8 17.2727 1.8H2.72727Z"
        fill="#EBEBEC"
      />
    </svg>
  )
}
