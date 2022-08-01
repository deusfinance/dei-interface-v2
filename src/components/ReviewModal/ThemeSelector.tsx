import React, { useMemo } from 'react'
import styled from 'styled-components'

import ThemeIconDark from 'components/Icons/ThemeIconDark'
import ThemeIconLight from 'components/Icons/ThemeIconLight'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  margin-top: -10px;
`

const RightElement = styled.div`
  margin-right: 25px;
  cursor: pointer;

  &:hover {
    filter: brightness(0.75);
  }
`

const HorizontalLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border2};
`

const Title = styled.div`
  font-weight: 400;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size:12px;
  `}
`

export default function ThemeSelector({
  title,
  amount,
  setAmount,
}: {
  title: string
  amount: boolean
  setAmount: (value: boolean) => void
}) {
  return useMemo(() => {
    return (
      <>
        <Wrapper>
          <Title>{title}</Title>
          <RightElement
            onClick={() => {
              setAmount(!amount)
            }}
          >
            {amount ? <ThemeIconDark width={72} height={36} /> : <ThemeIconLight width={72} height={36} />}
          </RightElement>
        </Wrapper>
        <HorizontalLine />
      </>
    )
  }, [title, amount, setAmount])
}
