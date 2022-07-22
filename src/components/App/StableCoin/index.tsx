import styled from 'styled-components'

import { PrimaryButton } from 'components/Button'
import { Row, RowBetween, RowEnd } from 'components/Row'

export const Container = styled(Row)`
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export const Wrapper = styled(Container)`
  margin-top: 28px;
  width: clamp(250px, 90%, 500px);
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.bg0};
  border-radius: 15px;
`

export const InputWrapper = styled(Container)`
  padding: 20px 15px;
  width: 100%;
  background: ${({ theme }) => theme.bg0};

  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

export const BottomWrapper = styled(Container)`
  padding: 20px 15px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-bottom-right-radius: 13px;
  border-bottom-left-radius: 13px;
`

export const TopTableau = styled.div`
  width: 100%;
  position: relative;
  padding: 0;
  border-radius: 13px 13px 0px 0px;
  height: 72px;

  background: ${({ theme }) => theme.bg0};
`

export const TableauTitle = styled.span`
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  font-size: 28px;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 21px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: 13px;

  `}
`

export const InfoWrapper = styled(RowBetween)`
  align-items: center;
  white-space: nowrap;
  font-size: 0.75rem;
  margin-top: 6px;
  height: 30px;
  width: 97%;
`

export const Title = styled.div`
  font-family: 'IBM Plex Mono';
  font-weight: 700;
  font-size: 32px;
  color: ${({ theme }) => theme.white};
`

export const TitleIMGWrap = styled(RowEnd)`
  border-radius: 15px;
`

export const MainButton = styled(PrimaryButton)`
  border-radius: 15px;
`
