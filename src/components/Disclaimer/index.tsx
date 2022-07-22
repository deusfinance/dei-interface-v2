import React from 'react'
import Image from 'next/image'
import styled from 'styled-components'

import { ExternalLink } from 'components/Link'
import Discord from '/public/static/images/footer/Discord.svg'
import Twitter from '/public/static/images/footer/Twitter.svg'
import Github from '/public/static/images/footer/Github.svg'
import Telegram from '/public/static/images/footer/Telegram.svg'
import { RowCenter, RowEnd } from 'components/Row'
import { isMobile } from 'react-device-detect'

const Wrapper = styled(RowCenter)`
  color: ${({ theme }) => theme.text3};
  background: ${({ theme }) => theme.bg2};
  text-align: center;
  gap: 20px;
  font-size: 13px;
  padding: 20px 100px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
    margin-top: 20px;
    padding: 20px;
  `}
`

const Text = styled.div`
  position: absolute;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: relative;

  `}
`

const Logos = styled(RowEnd)`
  gap: 28px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: center;
    gap: 30px;
  `}
`

export default function Disclaimer() {
  function getImageSize() {
    return isMobile ? 25 : 30
  }
  return (
    <Wrapper>
      <Text>
        <ExternalLink href="https://deus.finance" style={{ opacity: 0.5 }}>
          {new Date().getFullYear()} DEI Stablecoin. All rights to the people.
        </ExternalLink>
      </Text>
      <Logos>
        <Image src={Discord} alt="DEI Logo" width={getImageSize()} height={getImageSize()} />
        <Image src={Twitter} alt="DEI Logo" width={getImageSize()} height={getImageSize()} />
        <Image src={Github} alt="DEI Logo" width={getImageSize()} height={getImageSize()} />
        <Image src={Telegram} alt="DEI Logo" width={getImageSize()} height={getImageSize()} />
      </Logos>
    </Wrapper>
  )
}
