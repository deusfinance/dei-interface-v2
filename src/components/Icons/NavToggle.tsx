import React from 'react'
import { useTheme } from 'styled-components'

export default function NavToggle({ ...rest }: { [x: string]: any }) {
  const theme = useTheme()
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <g filter="url(#filter0_b_339_6816)">
        <rect width="36" height="36" rx="8" fill="#202229" />
        <rect x="0.5" y="0.5" width="35" height="35" rx="7.5" stroke="#EBEBEC" />
      </g>
      <g filter="url(#filter1_b_339_6816)">
        <rect x="8" y="11" width="20" height="2" rx="1" fill="#EBEBEC" />
      </g>
      <g filter="url(#filter2_b_339_6816)">
        <rect x="8" y="17" width="20" height="2" rx="1" fill="#EBEBEC" />
      </g>
      <g filter="url(#filter3_b_339_6816)">
        <rect x="8" y="23" width="20" height="2" rx="1" fill="#EBEBEC" />
      </g>
      <defs>
        <filter
          id="filter0_b_339_6816"
          x="-12"
          y="-12"
          width="60"
          height="60"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="6" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_339_6816" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_339_6816" result="shape" />
        </filter>
        <filter
          id="filter1_b_339_6816"
          x="-4"
          y="-1"
          width="44"
          height="26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="6" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_339_6816" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_339_6816" result="shape" />
        </filter>
        <filter
          id="filter2_b_339_6816"
          x="-4"
          y="5"
          width="44"
          height="26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="6" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_339_6816" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_339_6816" result="shape" />
        </filter>
        <filter
          id="filter3_b_339_6816"
          x="-4"
          y="11"
          width="44"
          height="26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="6" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_339_6816" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_339_6816" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}
