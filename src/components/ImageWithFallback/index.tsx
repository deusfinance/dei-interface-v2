import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import styled from 'styled-components'

import NotFound from '/public/static/images/fallback/not_found.png'

const Wrapper = styled.div<{
  round?: boolean
  border?: boolean
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ round }) => (round ? '50%' : '0px')};
  border: ${({ border, theme }) => (border ? `2px solid ${theme.text2}` : `0px solid ${theme.text2}`)};
`

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  loading = false,
  round = false,
  border = false,
  ...rest
}: {
  src: StaticImageData | string
  alt: string
  width: number
  height: number
  loading?: boolean
  round?: boolean
  border?: boolean
  [x: string]: any
}) {
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>('/static/images/fallback/loader.gif')

  useEffect(() => {
    if (loading) {
      setImgSrc('/static/images/fallback/loader.gif')
    } else {
      setImgSrc(src)
    }
  }, [src, loading])

  return (
    <Wrapper round={round} border={border}>
      <Image src={imgSrc} alt={alt} width={width} height={height} onError={() => setImgSrc(NotFound.src)} {...rest} />
    </Wrapper>
  )
}
