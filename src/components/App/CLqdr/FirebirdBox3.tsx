import React from 'react'
import styled from 'styled-components'
import { LQDR_ADDRESS } from 'constants/addresses'

import ImageWithFallback from 'components/ImageWithFallback'
import FIREBIRD_ICON from '/public/static/images/pages/clqdr/ic_firebird.svg'
import { ExternalLink } from 'components/Link'
import { RowEnd } from 'components/Row'
import { Wrapper, BuyButtonWrapper, BuyButton, ButtonText } from '.'

const BuyWrapper = styled(RowEnd)`
  margin-top: 2px;
`

const ButtonWrapper = styled(BuyButtonWrapper)`
  width: 165px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 36px;
    width:100px;
  `}
`

const Icon = styled.div`
  position: absolute;
  left: -18px;
  top: -20px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 50px;
  `}
`

const FirebirdText = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-top: 17px;
  background: linear-gradient(90deg, #f78c2a 0%, #f34038 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Text = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.text1};
`

const FireBirdWrap = styled.div`
  display: flex;
  white-space: nowrap;
`

export default function FirebirdBox3() {
  return (
    <Wrapper>
      <Icon>
        <ImageWithFallback src={FIREBIRD_ICON} width={106} height={120} alt={'icon'} />
      </Icon>
      <FireBirdWrap>
        <div>
          <Text>Need more LQDR?</Text>
          <FirebirdText>Buy it on Firebird Finance</FirebirdText>
        </div>
        <BuyWrapper>
          <ButtonWrapper>
            <ExternalLink
              href={`https://app.firebird.finance/swap?inputCurrency=FTM&outputCurrency=${LQDR_ADDRESS[250]}&net=250`}
              style={{ textDecoration: 'none' }}
            >
              <BuyButton>
                <ButtonText>Buy LQDR</ButtonText>
              </BuyButton>
            </ExternalLink>
          </ButtonWrapper>
        </BuyWrapper>
      </FireBirdWrap>
    </Wrapper>
  )
}
