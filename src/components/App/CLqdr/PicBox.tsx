import React from 'react'
import styled from 'styled-components'

import { RowBetween, RowCenter } from 'components/Row'
import { ExternalLink } from 'components/Link'
import { LQDR_ADDRESS, CLQDR_ADDRESS } from 'constants/addresses'

const MainWrapper = styled.div`
  overflow: hidden;
  width: 100%;
  height: 116px;
`

const RatioWrap = styled(RowBetween)`
  white-space: nowrap;
  font-size: 0.75rem;
  height: 50%;
`

const TopWrap = styled.div`
  background: ${({ theme }) => theme.bg1};
  height: 70%;
  border-radius: 12px 12px 0px 0px;
  padding: 12px;
`

const BottomWrap = styled(RowCenter)`
  display: flex;
  white-space: nowrap;
  font-size: 0.75rem;
  height: 30%;
  width: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.bg2};
  border-radius: 0px 0px 12px 12px;
  padding: 12px 16px;
`

const Name = styled.div`
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  display: flex;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size:12px
  `}
`

const Title = styled.div`
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size:14px
  `}
`

const Value = styled(Title)`
  font-size: 14px;
  line-height: 19px;
  display: flex;
  text-align: right;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size:12px
  `}
`

const GreenValue = styled(Value)`
  color: ${({ theme }) => theme.green1};
  margin-left: 5px;
`
const RedValue = styled(Value)`
  color: ${({ theme }) => theme.red1};
  margin-left: 5px;
`
const BlueName = styled(Name)`
  color: ${({ theme }) => theme.clqdrBlueColor};
  margin-left: 5px;
`

const LinkText = styled(Name)`
  line-height: 19px;
  text-align: center;
  text-decoration-line: underline;
  color: ${({ theme }) => theme.text1};
`

export default function PicBox() {
  return (
    <MainWrapper>
      <TopWrap>
        <RatioWrap>
          <Title>PiC or Not?</Title>

          <Value>
            APY cLQDR:
            <GreenValue>36.99%</GreenValue>
          </Value>
        </RatioWrap>
        <RatioWrap>
          <Name>
            Best option:<BlueName>Hodl cLQDR</BlueName>
          </Name>
          <Value>
            APY PiC:<RedValue>20.37%</RedValue>
          </Value>
        </RatioWrap>
      </TopWrap>
      <BottomWrap>
        <ExternalLink
          href={`https://app.firebird.finance/swap?inputCurrency=${LQDR_ADDRESS[250]}&outputCurrency=${CLQDR_ADDRESS[250]}&net=250`}
          style={{ textDecoration: 'underline', textDecorationColor: '#EBEBEC' }}
        >
          <LinkText>Check more on PiCorNot</LinkText>
        </ExternalLink>
      </BottomWrap>
    </MainWrapper>
  )
}
