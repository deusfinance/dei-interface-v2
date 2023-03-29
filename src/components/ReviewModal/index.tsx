import styled from 'styled-components'

import { OptionButton } from 'components/Button'

export const DefaultOptionButtonWrapper = styled.div<{ active?: boolean }>`
  width: 53px;
  height: 28px;
  display: inline-flex;
  padding: 2px;
  background: ${({ theme }) => theme.deiColor};
  border-radius: 4px;
  background: ${({ theme, active }) => (active ? theme.deusColor : 'transparent')};
  margin: 0px 8px;
  cursor: ${({ active }) => active && 'pointer'};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width:40px;
    margin: 0px 4px;
    `}
  ${({ active, theme }) => !active && ` border: 2px solid ${theme.border1};padding:0px;`}
`

export const DefaultOptionButton = styled(OptionButton)`
  font-family: 'IBM Plex Mono';
  font-size: 14px;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
  border: unset;
  margin: 0px;
  &:hover {
    border: unset;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width:50px;
    font-size: 10px;

  `}
`

export const CustomOptionWrapper = styled.div<{ active?: boolean }>`
  width: 71px;
  height: 28px;
  display: inline-flex;
  /* padding: 2px; */
  background: ${({ theme }) => theme.deiColor};
  border-radius: 4px;
  background: ${({ theme, active }) => (active ? theme.deiColor : 'transparent')};
  cursor: ${({ active }) => active && 'pointer'};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width:50px;
  `}
`

export const CustomOption = styled(DefaultOptionButton)`
  justify-content: flex-end;
  padding: 4px;
  border: 2px solid ${({ theme }) => theme.border1};

  &:hover {
    border: 2px solid ${({ theme }) => theme.border1};
  }
`

export const InputAmount = styled.input.attrs({ type: 'number' })<{ active?: boolean }>`
  color: ${({ theme }) => theme.text1};
  border: 0;
  outline: none;
  width: 100%;
  margin-right: 2px;
  font-size: 14px;
  background: transparent;
  ${({ active, theme }) =>
    active &&
    `
    color: ${theme.text1};
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 10px;
  `}
`

export const AmountsWrapper = styled.div<{ hasCustom?: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
`

export const AmountsInnerWrapper = styled.div<{ hasCustom?: boolean }>`
  display: flex;
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
  margin-top: 4px;
`

export const Title = styled.div`
  font-weight: 400;
  color: ${({ theme }) => theme.text2};
  display: flex;
  direction: row;
  justify-content: space-between;

  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `}
`
