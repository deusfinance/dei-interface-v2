import React from 'react'
import styled from 'styled-components'
import { RowBetween, RowCenter, RowStart } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'

import BEETHOVEN_ICON from '/public/static/images/pages/clqdr/ic_beethoven.svg'

const Wrapper = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  width: clamp(250px, 90%, 500px);
  background: ${({ theme }) => theme.bg3};
  padding: 12px 16px 16px 16px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 50px;
  `}
`

const BeethovenLogo = styled(RowCenter)`
  /* margin-top: 10px; */
`

const RatioWrap = styled(RowBetween)`
  white-space: nowrap;
  font-size: 0.75rem;
  margin-top: 6px;
  height: 30px;
`

const Name = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
`

const Value = styled.div`
  color: ${({ theme }) => theme.cLqdrColor};
`

const Text = styled(RowStart)`
  font-weight: 500;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
  color: ${({ theme }) => theme.text1};
`

// const BuyBeethovenButton = styled.div``

export default function BeethovenBox() {
  return (
    <Wrapper>
      <RowCenter>
        <ImageWithFallback src={BEETHOVEN_ICON} width={166} height={26} alt={`nft`} />
      </RowCenter>
      <Text>Buy on Beethoven for better ratio</Text>
      <RatioWrap>
        <Name>cLQDR/LQDR Ratio:</Name>
        <Value>2123</Value>
      </RatioWrap>
    </Wrapper>
  )
}
