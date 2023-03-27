import { isMobile } from 'react-device-detect'
import styled, { useTheme } from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { useCurrencyLogos } from 'hooks/useCurrencyLogo'

import ImageWithFallback from 'components/ImageWithFallback'

const TokenCell = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  & > * {
    &:first-child {
      margin-right: 12px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-basis: initial;
    margin-left: 0px;
  `};
`

const TokensWrap = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: start;
  gap: 6px;
  /* margin: 0 10px; */
`

export const MultipleImageWrapper = styled.div<{ isSingle?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;

  & > * {
    &:nth-child(2) {
      transform: translateX(-30%);
      margin-right: -9px;
    }
    &:nth-child(3) {
      transform: translateX(-60%);
      margin-right: -9px;
    }
    &:nth-child(4) {
      transform: translateX(-90%);
      margin-right: -9px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      width: 28px;
      height: 28px;
    }
`}
`

function getImageSize() {
  return isMobile ? 20 : 24
}

export default function TokenBox({
  tokens,
  title,
  active,
  chain,
}: {
  tokens: Token[]
  title: string
  active: boolean
  chain: string
}) {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)
  const theme = useTheme()

  return (
    <TokenCell>
      <MultipleImageWrapper isSingle={logos.length === 1}>
        {logos.map((logo, index) => {
          return (
            <ImageWithFallback
              src={logo}
              width={getImageSize()}
              height={getImageSize()}
              alt={`Logo`}
              key={index}
              round
              border
            />
          )
        })}
      </MultipleImageWrapper>
      <TokensWrap>
        <span style={{ textAlign: 'left' }}>{title}</span>
      </TokensWrap>
    </TokenCell>
  )
}
