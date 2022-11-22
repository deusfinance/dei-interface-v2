import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import ImageWithFallback from 'components/ImageWithFallback'
import { StakingType } from 'constants/stakingPools'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'

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

const MultipleImageWrapper = styled.div`
  display: flex;

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
  return isMobile ? 20 : 20
}

export default function PoolSelector({ pool }: { pool: StakingType }) {
  const tokens = pool.tokens
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
      {tokens.map((token, index) => {
        return (
          <div key={index}>
            <span>{token.name}</span>
            {index + 1 !== tokens.length && <span>-</span>}
          </div>
        )
      })}
    </TokenCell>
  )
}
