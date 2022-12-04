import React from 'react'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

import { ExternalLink } from 'components/Link'
import { RowCenter, RowEnd } from 'components/Row'

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
  margin-bottom: 32px;
  /* padding: 12px 100px; */

  /* ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    margin-top: 20px;
    padding: 10px;
  `} */
`

const Text = styled.div`
  position: absolute;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: relative;
  `}
`

const Logos = styled(RowEnd)`
  gap: 28px;
  img {
    &:hover {
      filter: brightness(1.5);
    }
  }
  /* ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: center;
    gap: 30px;
  `}; */
`

export default function Disclaimer() {
  function getImageSize() {
    return isMobile ? 25 : 30
  }
  return (
    <Wrapper>
      {/* <Text>
        <ExternalLink
          href="https://groups.csail.mit.edu/mac/classes/6.805/articles/crypto/cypherpunks/may-crypto-manifesto.html"
          style={{ opacity: 0.5 }}
        >
          {new Date().getFullYear()} DEI Stablecoin. All rights to the people.
        </ExternalLink>
      </Text> */}
      {/* <Logos> */}
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
      {/* </Logos> */}
    </Wrapper>
  )
}
