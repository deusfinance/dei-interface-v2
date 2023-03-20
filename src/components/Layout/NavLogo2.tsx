import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import DEUS_LOGO from '/public/static/images/DeusLogo.svg'
import DEUS_TEXT_LOGO from '/public/static/images/DeusTextLogo.svg'
import ImageWithFallback from 'components/ImageWithFallback'

import { ExternalLink } from 'components/Link'

const Wrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  gap: 16px;
  align-items: center;
  margin: 0 auto;
  padding: 16px 36px;
  width: 352px;

  ${({ isOpen }) =>
    !isOpen &&
    `
      min-width: 66px;
      padding: 20px 16px;
    `};

  &:hover {
    cursor: pointer;
  }
`

export default function NavLogo({ isOpen }: { isOpen: boolean }) {
  function getImageSize() {
    return isMobile ? 30 : 45
  }

  return (
    <Wrapper isOpen={isOpen}>
      {isOpen ? (
        <>
          <ExternalLink href="https://dei.finance" target="_self" passHref>
            <ImageWithFallback src={DEUS_LOGO} width={28} height={28} alt={`App Logo`} />
          </ExternalLink>
          <ImageWithFallback src={DEUS_TEXT_LOGO} width={68} height={20} alt={`App Name Logo`} />{' '}
        </>
      ) : (
        <ExternalLink href="https://dei.finance" target="_self" passHref>
          <ImageWithFallback src={DEUS_LOGO} width={28} height={28} alt={`App Logo`} />
        </ExternalLink>
      )}
    </Wrapper>
  )
}
