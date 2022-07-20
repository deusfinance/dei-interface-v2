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
  flex-wrap: nowrap;
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  gap: 20px;
  padding: 20px 100px;
  text-align: center;
  margin-top: 40px;
  position: relative;

  /* TODO: edit background color */
  background: #181a1f;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 20px;
    flex-direction: column;
    padding-left: 20px;
    padding-right:20px;

  `}
`

const Text = styled.div`
  position: absolute;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: relative;

  `}
`

const Logos = styled(RowEnd)`
  align-items: center;
  gap: 28px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content:center;
    gap:30px;

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
