import React from 'react'
import styled from 'styled-components'
import FIREBIRD_ICON from '/public/static/images/pages/clqdr/ic_firebird.svg'

import { RowBetween, RowCenter, RowStart } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { ExternalLink } from 'components/Link'
import { BuyButton, BuyButtonWrapper, Wrapper } from '.'
import { LQDR_ADDRESS, CLQDR_ADDRESS } from 'constants/addresses'

const MainWrapper = styled(Wrapper)`
  height: 170px;
  padding: 12px 16px 16px 16px;
`

const RatioWrap = styled(RowBetween)`
  white-space: nowrap;
  font-size: 0.75rem;
  margin-top: 6px;
  margin-bottom: 16px;
  height: 30px;
`

const Name = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
`

const Value = styled.div`
  color: ${({ theme }) => theme.green1};
`

const Text = styled(RowStart)`
  font-weight: 500;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
  color: ${({ theme }) => theme.text1};
`

const Icon = styled.div`
  position: absolute;
  left: -45px;
  top: -15px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 50px;
  `}
`

export default function FirebirdBox1({ ratio }: { ratio: string | number }) {
  return (
    <MainWrapper>
      <Icon>
        <ImageWithFallback src={FIREBIRD_ICON} width={174} height={198} alt={'icon'} />
      </Icon>
      <Text>Buy on Firebird for better ratio</Text>
      <RatioWrap>
        <Name>cLQDR/LQDR Ratio:</Name>
        <Value>{ratio}</Value>
      </RatioWrap>
      <RowCenter>
        <BuyButtonWrapper>
          <ExternalLink
            href={`https://app.firebird.finance/swap?inputCurrency=${LQDR_ADDRESS[250]}&outputCurrency=${CLQDR_ADDRESS[250]}&net=250`}
            style={{ textDecoration: 'none' }}
          >
            <BuyButton>Buy cLQDR from Firebird</BuyButton>
          </ExternalLink>
        </BuyButtonWrapper>
      </RowCenter>
    </MainWrapper>
  )
}
