import React from 'react'
import styled from 'styled-components'
import ImageWithFallback from 'components/ImageWithFallback'

import FIREBIRD_ICON from '/public/static/images/pages/clqdr/ic_firebird.svg'
import { ExternalLink } from 'components/Link'
import { RowEnd } from 'components/Row'

const Wrapper = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  width: clamp(250px, 90%, 500px);
  background: ${({ theme }) => theme.bg3};
  padding: 12px;
  height: 88px;
  position: relative;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    // height: 50px;
  `}
`

const BuyWrapper = styled(RowEnd)`
  margin-top: 2px;
`

const BuyButtonWrapper = styled.div`
  padding: 2px;
  width: 165px;
  height: 56px;
  background: linear-gradient(90deg, #f34038 0%, #ffb396 52.08%, #f78c2a 100%);
  border-radius: 12px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 36px;
    width:100px;
  `}
`

const BuyButton = styled.div`
  width: 100%;
  height: 100%;

  background: linear-gradient(90deg, #f78c2a 0%, #f34038 100%),
    linear-gradient(90deg, #f34038 0%, #ffb396 52.08%, #f78c2a 100%);

  border-radius: 12px;

  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;

  text-align: center;
  outline: none;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;

  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
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

export default function FireBirdBox() {
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
          <BuyButtonWrapper>
            <ExternalLink href={'https://beets.fi/swap'} style={{ textDecoration: 'none' }}>
              <BuyButton>Buy LQDR</BuyButton>
            </ExternalLink>
          </BuyButtonWrapper>
        </BuyWrapper>
      </FireBirdWrap>
    </Wrapper>
  )
}
