import { Token } from '@sushiswap/core-sdk'
import ImageWithFallback from 'components/ImageWithFallback'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'

const TokenCell = styled.div<{ hasReward: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  margin-top: 12px;
  flex-direction: ${({ hasReward }) => (hasReward ? 'column' : 'row')};
  gap: 10px;
`

const TokenWrap = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 10px;
`

export const DeusText = styled.span`
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

function getImageSize() {
  return isMobile ? 16 : 18
}

export default function RewardBox({ tokens, rewardAmounts }: { tokens: Token[]; rewardAmounts: number[] }) {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)

  return (
    <TokenCell hasReward={rewardAmounts.every((value) => value !== 0)}>
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
              {rewardAmounts[index] !== 0 &&
                !Object.is(Number(rewardAmounts[index]), NaN) &&
                Number(rewardAmounts[index]).toFixed(2)}
              {' ' + token.name}
            </DeusText>
          </TokenWrap>
        )
      })}
    </TokenCell>
  )
}
