import { useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import Link from 'next/link'
import { isMobile } from 'react-device-detect'

import { RowBetween } from 'components/Row'

const Wrapper = styled(RowBetween)<{ disabled?: boolean }>`
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg0};
  overflow: hidden;
  min-width: 302px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border2};

  & > * {
    &:first-child {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      height: 100px;
      width: 100%;
    }
  }
  &:hover {
    border-color: ${({ theme, disabled }) => (disabled ? theme.border2 : theme.text3)};
    background: ${({ theme, disabled }) => (disabled ? theme.bg0 : theme.bg3)};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width:160px;
    & > * {
      &:first-child {
        height: 78px;
        padding: 12px;
      }
  }
  `};
`

const LeftWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width:130px;
  `};
`

const TitleWrap = styled.div<{ DeiActive?: boolean; DeusActive?: boolean }>`
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  font-size: 20px;

  ${({ DeiActive }) =>
    DeiActive &&
    `
    background: -webkit-linear-gradient(1deg, #e29d52, #de4a7b 55%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `};
  ${({ DeusActive }) =>
    DeusActive &&
    `
    background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
  `}
`

const SubText = styled.div<{ active: boolean; soon: boolean }>`
  color: ${({ theme, active }) => (active ? theme.text4 : theme.text2)};
  font-size: 12px;

  ${({ soon }) =>
    soon &&
    `
    background: -webkit-linear-gradient(1deg, #e29d52 -10.26%, #de4a7b 90%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `}
`

const AnchorTag = styled.a<{ disabled?: boolean }>`
  text-decoration: none;
  ${({ disabled }) =>
    disabled &&
    `
    pointer-events: none;
  `};
`

export const getImageSize = () => {
  return isMobile ? 50 : 80
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
  const disabled = href === ''

  return (
    <Wrapper disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link href={href} passHref>
        <AnchorTag disabled={disabled}>
          <LeftWrap>
            <TitleWrap DeusActive={hover && title === 'veDEUS' && !disabled} DeiActive={hover && !disabled}>
              {title}
            </TitleWrap>
            <SubText soon={subTitle === 'Coming Soon...'} active={hover}>
              {subTitle}
            </SubText>
          </LeftWrap>
          <Image
            src={(hover || isMobile) && !disabled ? HoverIcon : MainIcon}
            height={getImageSize()}
            width={getImageSize()}
            alt={'icon'}
          />
        </AnchorTag>
      </Link>
    </Wrapper>
  )
}
