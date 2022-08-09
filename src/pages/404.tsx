import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'

import { RowCenter } from 'components/Row'
import NotFound from 'components/Icons/404'
import HUMAN from '/public/static/images/pages/404/Human.svg'

const Wrapper = styled(RowCenter)`
  margin-top: 147px;
  flex-direction: column;
  position: absolute;
`

const ImageWrapper = styled.div`
  position: absolute;
  bottom: 60px;
  width: 127px;
  height: 250px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100px;
    height: 200px;
    bottom: 40px;
  `}
`

export default function Custom404() {
  function getImageWidth() {
    return isMobile ? 345 : 455
  }
  function getImageHeight() {
    return isMobile ? 240 : 314
  }

  return (
    <>
      <Wrapper>
        <NotFound width={getImageWidth()} height={getImageHeight()} />
        <ImageWrapper>
          <Image src={HUMAN} width={'127px'} height={'250px'} alt="Logo" />
        </ImageWrapper>
      </Wrapper>
    </>
  )
}
