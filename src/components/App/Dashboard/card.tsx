import { useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import Link from 'next/link'
import { isMobile } from 'react-device-detect'

import { RowBetween } from 'components/Row'

const Wrapper = styled(RowBetween)`
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg2};
  overflow: hidden;
  max-width: 360px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border2};

  & > * {
    &:first-child {
      padding: 24px;
      height: 100px;
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
  }
  &:hover {
    border-color: ${({ theme }) => theme.text3};
    background: ${({ theme }) => theme.bg3};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 170px;
    & > * {
      &:first-child {
        height: 78px;
        padding: 12px;
      }
  }
  `};
`
const LeftWrap = styled.div`
  font-family: 'IBM Plex Mono';
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  & > * {
    &:nth-child(1) {
      font-size: 20px;
      color: ${({ theme }) => theme.text1};
    }
    &:nth-child(2) {
      font-size: 12px;
      color: ${({ theme }) => theme.text2};
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    & > * {
    &:nth-child(1) {
      font-size: 16px;
    }
    &:nth-child(2) {
      font-size: 10px;
    }
  }
  `};
`

export const getImageSize = () => {
  return isMobile ? 36 : 90
}

export const Card = ({
  title,
  subTitle,
  href,
  MainIcon,
  HoverIcon,
}: {
  title: string | null
  subTitle: string | null
  href: string
  MainIcon: StaticImageData | string
  HoverIcon: StaticImageData | string
}): JSX.Element => {
  const [hover, setHover] = useState(false)

  return (
    <Wrapper onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link href={href} passHref>
        <a style={{ textDecoration: 'none' }}>
          <LeftWrap>
            <div>{title}</div>
            <div>{subTitle}</div>
          </LeftWrap>
          <Image src={hover ? HoverIcon : MainIcon} height={getImageSize()} width={getImageSize()} alt={'icon'} />
        </a>
      </Link>
    </Wrapper>
  )
}
