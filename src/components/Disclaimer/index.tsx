import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { ExternalLink } from 'components/Link'
import { RowCenter } from 'components/Row'
import Image from 'next/image'
import Discord from '/public/static/images/footer/Discord.svg'
import Twitter from '/public/static/images/footer/Twitter.svg'
import Github from '/public/static/images/footer/Github.svg'
import Telegram from '/public/static/images/footer/Telegram.svg'

const Wrapper = styled(RowCenter)`
  color: ${({ theme }) => theme.text3};
  background: ${({ theme }) => theme.bg0};
  text-align: center;
  gap: 50px;
  font-size: 13px;
  margin-bottom: 36px;

  & > a {
    img {
      opacity: 0.6;
    }
    &:hover {
      img {
        opacity: 1;
      }
    }
  }
`

function getImageSize() {
  return isMobile ? 25 : 30
}
export default function Disclaimer() {
  return (
    <Wrapper>
      <ExternalLink href="https://discord.gg/xTTaBBAMgG">
        <Image src={Discord} alt="Discord Logo" width={getImageSize()} height={getImageSize()} />
      </ExternalLink>
      <ExternalLink href="https://twitter.com/DeusDao">
        <Image src={Twitter} alt="Twitter Logo" width={getImageSize()} height={getImageSize()} />
      </ExternalLink>
      <ExternalLink href="http://github.com/deusfinance">
        <Image src={Github} alt="Github Logo" width={getImageSize()} height={getImageSize()} />
      </ExternalLink>
      <ExternalLink href="https://t.me/deusfinance">
        <Image src={Telegram} alt="Telegram Logo" width={getImageSize()} height={getImageSize()} />
      </ExternalLink>
    </Wrapper>
  )
}
