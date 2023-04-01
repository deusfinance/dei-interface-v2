import styled from 'styled-components'

import { useWalletModalToggle } from 'state/application/hooks'
import { DotFlashing } from 'components/Icons'
import { PrimaryButton } from 'components/Button'
import { Row, RowCenter, RowBetween, RowEnd } from 'components/Row'

export const Container = styled(Row)`
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

export const Wrapper = styled(Container)`
  margin-top: 28px;
  width: clamp(250px, 90%, 500px);
  background: ${({ theme }) => theme.bg0};
  border-radius: 16px;
  overflow: hidden;
`

export const InputWrapper = styled(Container)`
  padding: 4px 12px;
  width: 100%;
  background: ${({ theme }) => theme.bg3};
  gap: 12px;
`

export const BottomWrapper = styled(Container)`
  font-family: 'IBM Plex Mono';
  gap: 12px;
  margin-top: 2px;
  padding: 20px 16px;
  & > * {
    font-weight: 500;
  }

  background: ${({ theme }) => theme.bg3};
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
  display: flex;
  margin-left: 24px;
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  font-size: 24px;
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
  font-family: 'IBM Plex Mono';
  color: ${({ theme }) => theme.bg0};

  ${({ theme, disabled }) =>
    disabled &&
    `
    color: ${theme.white};
  `}

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 60px;
  `}
`

export const GradientButtonWrap = styled(PrimaryButton)`
  background: ${({ theme }) => theme.deusColor};
  border-radius: 12px;
  padding: 2px;
  width: 100%;
  height: 72px;
  cursor: pointer;
`

export const GradientButtonRow = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  height: 100%;
  width: 100%;
  white-space: nowrap;
`

export const GradientButtonText = styled.span`
  display: flex;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
  color: ${({ theme }) => theme.bg0};
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

export function GradientButton({
  title,
  awaiting,
  onClick,
}: {
  title: string
  awaiting?: boolean
  onClick?: () => void
}) {
  return (
    <GradientButtonWrap onClick={onClick}>
      <GradientButtonRow>
        <GradientButtonText>
          {title} {awaiting && <DotFlashing />}
        </GradientButtonText>
      </GradientButtonRow>
    </GradientButtonWrap>
  )
}

export function ConnectWallet() {
  const toggleWalletModal = useWalletModalToggle()
  return <GradientButton title="Connect Wallet" onClick={toggleWalletModal} />
}
