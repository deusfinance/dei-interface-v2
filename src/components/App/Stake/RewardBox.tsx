import { Token } from '@sushiswap/core-sdk'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

const TokenCell = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
`

const TokenWrap = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
  margin: 0 10px;
`

export const DeusText = styled.span`
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

function getImageSize() {
  return isMobile ? 16 : 18
}

export default function RewardBox({ tokens }: { tokens: Token[] }) {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)

  const rewardAmount = 0

  return (
    <TokenCell>
      {tokens.map((token, index) => {
        return (
          <TokenWrap key={index}>
            <ImageWithFallback
              src={logos[index]}
              width={getImageSize()}
              height={getImageSize()}
              alt={`${token?.symbol} Logo`}
              round
            />
            <DeusText>
              {!!rewardAmount && `${rewardAmount} `}
              {token.name}
            </DeusText>
          </TokenWrap>
        )
      })}
    </TokenCell>
  )
}
