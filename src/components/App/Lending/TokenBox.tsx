import { Token } from '@sushiswap/core-sdk'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

const TokenCell = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  flex-basis: 18%;

  & > * {
    &:first-child {
      margin-right: 8px;
    }
  }
`

const TokenWrap = styled.div`
  /* display: flex; */
  /* flex-flow: row nowrap; */
  /* align-items: center; */
  /* gap: 10px; */
  /* margin: 0 10px; */
`

const MultipleImageWrapper = styled.div`
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
  return isMobile ? 22 : 30
}

export default function TokenBox({ tokens, title }: { tokens: Token[]; title: string }) {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)

  return (
    <TokenCell>
      <MultipleImageWrapper>
        {logos.map((logo, index) => {
          return (
            <ImageWithFallback
              src={logo}
              width={getImageSize()}
              height={getImageSize()}
              alt={`Logo`}
              key={index}
              round
            />
          )
        })}
      </MultipleImageWrapper>
      <span>{title}</span>
      {/* {tokens.map((token, index) => {
        return (
          <TokenWrap key={index}>
            <span>{token.name}</span>
            {index + 1 !== tokens.length && <span>-</span>}
          </TokenWrap>
        )
      })} */}
    </TokenCell>
  )
}
