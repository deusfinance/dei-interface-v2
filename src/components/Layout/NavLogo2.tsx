import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import DEI_LOGO from '/public/static/images/NewDeiLogo.svg'
import ImageWithFallback from 'components/ImageWithFallback'

import { ExternalLink } from 'components/Link'

const Container = styled.div`
  /* margin-right: auto; */
  width: 336px;
  height: 100%;
`

const Wrapper = styled.div`
  display: flex;

  align-items: center;
  margin: 0 auto;

  &:hover {
    cursor: pointer;
  }

  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 26px;

  background: ${({ theme }) => theme.deiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Text = styled.div`
  margin-left: 16px;
`

export default function NavLogo() {
  function getImageSize() {
    return isMobile ? 30 : 45
  }

  return (
    <Wrapper>
      <ExternalLink href="https://dei.finance" target="_self" passHref>
        {/* <div> */}
        {/* <Image src={'/static/images/NewDeiLogo.svg'} alt="App Logo" width={30} height={24} /> */}
        <ImageWithFallback src={DEI_LOGO} width={30} height={24} alt={`App Logo`} />
        {/* </div> */}
      </ExternalLink>
      <Text>DEI Finance</Text>
    </Wrapper>
  )
}
