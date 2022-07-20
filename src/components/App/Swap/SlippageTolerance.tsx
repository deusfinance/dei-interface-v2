import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { Button as RebassButton } from 'rebass/styled-components'

export const Base = styled(RebassButton)<{ padding?: string; borderRadius?: string; active?: any }>`
  padding: ${({ padding }) => (padding ? padding : '0')};
  width: ${({ width }) => width && width};
  height: ${({ height }) => height && height};
  font-weight: 400;
  text-align: center;
  border-radius: 6px;
  border-radius: ${({ borderRadius }) => borderRadius && borderRadius};
  outline: none;
  border: 0;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: ${({ active }) => active && 'pointer'};
  position: relative;
  z-index: 1;
  transition: all 0.35s;

  &:disabled {
    cursor: auto;
  }
  > * {
    user-select: none;
  }
`

const TopBorderWrap = styled.div<{ theme?: any; active?: any }>`
  background: ${({ theme, active }) => (active ? theme.primary4 : theme.text2)};
  padding: 1px;
  border-radius: 4px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.bg0};

  &:hover {
    border: 1px solid ${({ theme, active }) => (active ? theme.bg0 : theme.warning)};
  }
`

export const Option = styled(Base)<{ theme?: any; active?: any; bgColor?: string }>`
  display: inline-flex;
  height: 25px;
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
  background: ${({ theme }) => theme.bg0};
  border-radius: 4px;
  width: 50px;
  font-size: 13px;
  transition: all 0s;
  cursor: ${({ active }) => (active ? 'default' : 'pointer')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    width: 37px;
  `}
`

const DefaultAmountsWrap = styled.div`
  display: flex;
`

const TopBorder = styled.div`
  border-radius: 4px;
  background: ${({ theme }) => theme.bg0};
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
`

export const CustomOption = styled.div<{ active?: any }>`
  font-size: 13px;
  height: 25px;
  margin: 1px;
  padding: 0 5px;
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  border-radius: 6px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 55px;
    font-size: 12px;
  `}
`

const InputSlippage = styled.input.attrs({ type: 'number', min: 0.1 })`
  direction: rtl;
  color: #ffffff;
  border: 0px;
  border: 0;
  outline: none;
  width: 60px;
  margin-right: 2px;
  background: transparent;
`

const TitleSpan = styled.span`
  font-size: 12px;
`

const defaultAmounts = [0.1, 0.5, 1]

export default function SlippageTolerance({
  slippage,
  setSlippage,
  bgColor,
}: {
  slippage: number
  setSlippage: (value: number) => void
  style: any
  bgColor: string
}) {
  const [customActive, setCustomActive] = useState(false)

  const handleMinSlippage = useCallback(() => {
    if (slippage < 0.1) {
      setSlippage(0.1)
      setCustomActive(false)
    }
  }, [setSlippage, slippage, setCustomActive])

  const handleCustomChange = useCallback(
    (e) => {
      if (e.currentTarget.value !== '') {
        setCustomActive(true)
        setSlippage(parseFloat(e.currentTarget.value))
      } else {
        setCustomActive(false)
        setSlippage(0.5)
      }
    },
    [setSlippage, setCustomActive]
  )

  return useMemo(() => {
    return (
      <>
        <TitleSpan>Slippage Tolerance</TitleSpan>
        <DefaultAmountsWrap>
          {defaultAmounts.map((amount) => {
            return (
              <TopBorderWrap active={amount === slippage && !customActive} key={amount}>
                <TopBorder>
                  <Option
                    active={amount === slippage && !customActive}
                    bgColor={bgColor}
                    onClick={() => {
                      setCustomActive(false)
                      setSlippage(amount)
                    }}
                  >
                    {amount}%
                  </Option>
                </TopBorder>
              </TopBorderWrap>
            )
          })}
          <TopBorderWrap active={customActive}>
            <TopBorder>
              <CustomOption>
                <InputSlippage
                  value={customActive ? slippage : ''}
                  onBlur={handleMinSlippage}
                  onChange={(e) => handleCustomChange(e)}
                />
                %
              </CustomOption>
            </TopBorder>
          </TopBorderWrap>
        </DefaultAmountsWrap>
      </>
    )
  }, [setSlippage, handleCustomChange, handleMinSlippage, slippage, setCustomActive, bgColor, customActive])
}
