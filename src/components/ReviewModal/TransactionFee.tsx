import React, { useMemo } from 'react'
import styled from 'styled-components'

import QuestionMark from 'components/Icons/QuestionMark'
import { ToolTip } from 'components/ToolTip'
import { AmountsWrapper, DefaultOptionButton, QuestionMarkWrap } from './index'

const Wrapper = styled.div`
  justify-content: space-between;
  padding: 10px 20px;
`

export const Title = styled.div`
  font-weight: 400;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `}
`

export const Option = styled(DefaultOptionButton)`
  height: 42px;
  width: 120px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size:12px;
    width: 80px;
    height: 36px;
    margin: 0 auto;
  `}
`

const Amounts = styled(AmountsWrapper)`
  justify-content: flex-start;
`

export default function TransactionFee({
  title,
  amount,
  setAmount,
  defaultAmounts,
  toolTipData,
}: {
  title: string
  amount: number
  setAmount: (value: number) => void
  defaultAmounts: number[]
  toolTipData: string
}) {
  function outputText(index: number) {
    switch (index) {
      case 0:
        return 'Standard'
      case 1:
        return 'Fast'
      case 2:
        return 'Rapid'
    }
  }

  return useMemo(() => {
    return (
      <Wrapper>
        <Title>
          {title}
          <QuestionMarkWrap>
            <ToolTip id="id" />
            <QuestionMark data-for="id" data-tip={toolTipData} width={12} height={12} />
          </QuestionMarkWrap>
        </Title>
        <Amounts>
          {defaultAmounts.map((a, index) => {
            return (
              <Option
                key={a}
                active={amount === index + 1}
                onClick={() => {
                  setAmount(index + 1)
                }}
              >
                {/* {`${outputText(index)} (${a})`} */}
                {`${outputText(index)}`}
              </Option>
            )
          })}
        </Amounts>
      </Wrapper>
    )
  }, [title, toolTipData, defaultAmounts, amount, setAmount])
}
