import React from 'react'
import styled from 'styled-components'
import ImageWithFallback from 'components/ImageWithFallback'

import FIREBIRD_ICON from '/public/static/images/pages/clqdr/ic_firebird.svg'
import LQDR_ICON from '/public/static/images/tokens/lqdr.svg'
import { ExternalLink } from 'components/Link'
import { RowCenter } from 'components/Row'
import { BuyButton, BuyButtonWrapper, Wrapper } from '.'

const MainWrapper = styled(Wrapper)`
  padding: 12px 16px 16px 16px;
  height: 158px;
`

const BuyWrapper = styled(RowCenter)`
  margin-top: 16px;
`

const MainBuyButton = styled(BuyButton)`
  position: relative;
`

const Icon = styled.div`
  position: absolute;
  left: -45px;
  top: -15px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 50px;
  `}
`

const LittleIcon = styled.div`
  position: absolute;
  right: 26px;
`

const Text = styled.div`
  font-weight: 500;
  font-family: 'IBM Plex Mono';
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
  color: ${({ theme }) => theme.text1};
`

export default function FirebirdBox2() {
  return (
    <MainWrapper>
      <ImageWithFallback src={LQDR_ICON} width={28} height={28} alt={'lqdr_icon'} />
      <Icon>
        <ImageWithFallback src={FIREBIRD_ICON} width={174} height={198} alt={'firebird_icon'} />
      </Icon>
      <div>
        <Text>You have no LQDR to mint cLQDR with!</Text>
      </div>
      <BuyWrapper>
        <BuyButtonWrapper>
          <ExternalLink href={'https://app.firebird.finance/swap'} style={{ textDecoration: 'none' }}>
            <MainBuyButton>
              Buy LQDR from Firebird
              <LittleIcon>
                <ImageWithFallback src={FIREBIRD_ICON} width={35} height={40} alt={'firebird_icon'} />
              </LittleIcon>
            </MainBuyButton>
          </ExternalLink>
        </BuyButtonWrapper>
      </BuyWrapper>
    </MainWrapper>
  )
}
