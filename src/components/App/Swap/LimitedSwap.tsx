import styled from 'styled-components'
import {
  GradientButton,
  GradientButtonRow,
  GradientButtonText,
  GradientButtonWrap,
  Wrapper,
} from 'components/App/StableCoin'
import { Row, RowCenter } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'

import DEUS from '/public/static/images/tokens/deus.svg'
import TripleArrow from '/public/static/images/pages/swap/tripleArrowRight.svg'

const MainWrapper = styled(Wrapper)`
  height: 160px;
  margin-top: 16px;
  padding: 12px 16px 16px 16px;
  background: ${({ theme }) => theme.bg3};
`

const TokensWrap = styled(RowCenter)``

const Text = styled.div`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  margin: 16px 0px;
  background: ${({ theme }) => theme.text1};
`

const Logos = styled(Row)`
  margin: 0px 4px;
  width: unset;
  & > * {
    &:nth-child(2) {
      margin: 0px 8px;
    }
  }
`

const GradientText = styled(GradientButtonText)`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
`

const ButtonRow = styled(GradientButtonRow)`
  background: ${({ theme }) => theme.bg0};
`

export default function LimitedSwap() {
  return (
    <MainWrapper>
      <TokensWrap>
        <GradientText>1:</GradientText>
        <Logos>
          <ImageWithFallback
            src={DEUS}
            width={28}
            height={28}
            alt={` Logo`}
            round
            style={{ border: '1px solid red' }}
          />
          <ImageWithFallback src={TripleArrow} width={32} height={14} alt={` Logo`} />
          <ImageWithFallback src={DEUS} width={28} height={28} alt={`$ Logo`} />
        </Logos>
        <GradientText>:2</GradientText>
      </TokensWrap>
      <Text>You whitelisted, enjoy it.</Text>
      <GradientButtonWrap>
        <ButtonRow>
          <GradientButtonText>Go to Limited Swap</GradientButtonText>
        </ButtonRow>
      </GradientButtonWrap>
    </MainWrapper>
  )
}
