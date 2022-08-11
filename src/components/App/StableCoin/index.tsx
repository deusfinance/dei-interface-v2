import styled from 'styled-components'

import { PrimaryButton } from 'components/Button'
import { Row, RowBetween, RowEnd, RowCenter } from 'components/Row'
import { useWalletModalToggle } from 'state/application/hooks'

export const Container = styled(Row)`
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export const Wrapper = styled(Container)`
  margin-top: 28px;
  width: clamp(250px, 90%, 500px);
  background: ${({ theme }) => theme.bg0};
  /* border: 1px solid ${({ theme }) => theme.bg0}; */
  border-radius: 15px;
  overflow: hidden;
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
  padding-top: 10px;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
`

export const TopTableau = styled.div`
  width: 100%;
  position: relative;
  padding: 0;
  height: 60px;
  background: ${({ theme }) => theme.bg2};
  overflow: hidden;
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    height: 50px;
  `}
`

export const TableauTitle = styled.span`
  font-weight: 600;
  font-size: 28px;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% - 18px);
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 23px;
    top: calc(50% - 14px);
  `}
`

export const InfoWrapper = styled(RowBetween)`
  white-space: nowrap;
  font-size: 0.75rem;
  margin-top: 6px;
  height: 30px;
`

export const Title = styled.div`
  font-weight: 700;
  font-size: 32px;
  color: ${({ theme }) => theme.white};
`

export const TitleIMGWrap = styled(RowEnd)`
  border-radius: 15px;
`

export const MainButton = styled(PrimaryButton)`
  border-radius: 12px;
  width: 100%;
  height: 72px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 60px;
  `}
`

export const CriticalButton = styled(MainButton)`
  /* background: ${({ theme }) => theme.red1}; */
`

const ConnectButtonWrap = styled(PrimaryButton)`
  background: ${({ theme }) => theme.specialBG1};
  border-radius: 12px;
  padding: 2px;
  width: 100%;
  height: 72px;
  cursor: pointer;
`

export const ConnectButton = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 8px;
  height: 100%;
  width: 100%;
  white-space: nowrap;
`

export const ConnectButtonText = styled.span`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
  background: -webkit-linear-gradient(0deg, #e29d52 -10.26%, #de4a7b 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export function ConnectWallet() {
  const toggleWalletModal = useWalletModalToggle()
  return (
    <ConnectButtonWrap onClick={toggleWalletModal}>
      <ConnectButton>
        <ConnectButtonText>Connect Wallet</ConnectButtonText>
      </ConnectButton>
    </ConnectButtonWrap>
  )
}
