import styled from 'styled-components'

import { OptionButton } from 'components/Button'

export const DefaultOptionButton = styled(OptionButton)`
  display: inline-flex;
  margin: 1px;
  margin-right: 10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-right: 5px;
      white-space: normal;
  `}
`

export const CustomOption = styled(DefaultOptionButton)`
  justify-content: flex-end;
  width: 85px;
  margin-right: 0px;
  padding: 0 5px;
  border-radius: 8px;
`

export const InputAmount = styled.input.attrs({ type: 'number' })<{ active?: boolean }>`
  color: ${({ theme }) => theme.text1};
  border: 0;
  outline: none;
  width: 100%;
  margin-right: 2px;
  margin-left: 2px;
  font-size: 0.95rem;
  background: transparent;
  ${({ active, theme }) =>
    active &&
    `
    color: ${theme.text2};
  `}
`

export const AmountsWrapper = styled.div<{ hasCustom?: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  margin-top: 16px;
`

export const AmountsInnerWrapper = styled.div<{ hasCustom?: boolean }>`
  ${({ hasCustom, theme }) =>
    !hasCustom &&
    theme.mediaWidth.upToSmall`
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
  `}
`

export const QuestionMarkWrap = styled.div`
  margin-left: 6px;
  display: inline;
  background: transparent;
`

export const Title = styled.div`
  font-family: 'Roboto';
  font-weight: 400;
  color: ${({ theme }) => theme.text2};
  display: flex;
  direction: row;
  justify-content: space-between;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `}
`
