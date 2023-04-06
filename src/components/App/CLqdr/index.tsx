import styled from 'styled-components'

import { Row, RowEnd, RowStart } from 'components/Row'

export const Wrapper = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  padding: 12px;
  height: 88px;
  position: relative;
  overflow: hidden;
`

export const BuyButtonWrapper = styled.div`
  padding: 2px;
  width: 452px;
  height: 56px;
  background: ${({ theme }) => theme.lqdrColor};
  border-radius: 12px;
`

export const BuyButton = styled.div`
  width: 100%;
  height: 100%;
  font-family: 'Inter';

  background: ${({ theme }) => theme.bg1};

  border-radius: 12px;

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

  color: ${({ theme }) => theme.lqdrColor};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
  `}
`

export const ButtonText = styled.span`
  font-family: 'Inter';
  background: ${({ theme }) => theme.lqdrColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export const ItemWrapper = styled.div`
  border-radius: 0px 0px 12px 12px;
  background: ${({ theme }) => theme.bg1};
  width: 100%;
  & > * {
    &:last-child {
      border-radius: 0px 0px 12px 12px;
    }
  }
`

export const Item = styled(Row)`
  width: 100%;
  height: 48px;
  padding: 16px 16px 16px 24px;
  background: ${({ theme }) => theme.bg1};

  &:hover {
    background: ${({ theme }) => theme.bg2};
  }
`

export const ItemText = styled(RowStart)`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;

  color: ${({ theme }) => theme.text2};
  width: 100%;
`

export const ItemValue = styled(RowEnd)`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  cursor: pointer;
  line-height: 16px;
  text-decoration-line: underline;

  color: ${({ theme }) => theme.text1};
  width: 100%;
`
