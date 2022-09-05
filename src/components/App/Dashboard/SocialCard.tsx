import { useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'

import DISCORD_LOGO from '/public/static/images/pages/dashboard/ic_discord_gray.svg'
import DISCORD_HOVER_LOGO from '/public/static/images/pages/dashboard/ic_discord_hover.svg'
import TELEGRAM_LOGO from '/public/static/images/pages/dashboard/ic_telegram_gray.svg'
import TELEGRAM_HOVER_LOGO from '/public/static/images/pages/dashboard/ic_telegram_hover.svg'

import { RowBetween } from 'components/Row'
import { ExternalLink } from 'components/Link'

const Wrapper = styled(RowBetween)`
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg0};
  /* max-width: 400px; */
  min-width: 302px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border2};
  overflow: hidden;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      min-width:160px;
  `};
`

const TelegramWrap = styled.div`
  width: 50%;
  & > * {
    &:first-child {
      cursor: pointer;
      gap: 12px;
      height: 100px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      justify-content: center;
      border-left: 2px solid ${({ theme }) => theme.bg2};
    }
    &:hover {
      background: #2986b2;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    & > * {
        &:first-child {
            height: 78px;
            padding: 12px;
        }
  `};
`
const DiscordWrap = styled(TelegramWrap)`
  & > * {
    &:first-child {
      border-left: 0;
    }
    &:hover {
      background: #8f97e9;
    }
  }
`

const Title = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `}
`
export const getImageSize = () => {
  return isMobile ? 36 : 50
}

export const SocialCard = (): JSX.Element => {
  const [hover1, setHover1] = useState(false)
  const [hover2, setHover2] = useState(false)
  return (
    <Wrapper>
      <DiscordWrap onMouseEnter={() => setHover1(true)} onMouseLeave={() => setHover1(false)}>
        <ExternalLink href={'https://discord.gg/xTTaBBAMgG'} style={{ textDecoration: 'none' }}>
          <Image
            height={getImageSize()}
            width={getImageSize()}
            src={hover1 || isMobile ? DISCORD_HOVER_LOGO : DISCORD_LOGO}
            alt={'icon'}
          />
          <Title>Discord</Title>
        </ExternalLink>
      </DiscordWrap>
      <TelegramWrap onMouseEnter={() => setHover2(true)} onMouseLeave={() => setHover2(false)} style={{ margin: 0 }}>
        <ExternalLink href={'https://t.me/deusfinance'} style={{ textDecoration: 'none' }}>
          <Image
            height={getImageSize()}
            width={getImageSize()}
            src={hover2 || isMobile ? TELEGRAM_HOVER_LOGO : TELEGRAM_LOGO}
            alt={'icon'}
          />
          <Title>Telegram</Title>
        </ExternalLink>
      </TelegramWrap>
    </Wrapper>
  )
}
