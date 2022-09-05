import React from 'react'
import styled from 'styled-components'
import StyledModal from 'styled-react-modal'

import { Close as CloseIcon } from 'components/Icons'
import { ChevronLeft as ChevronLeftIcon } from 'components/Icons'
import { ThemedText } from 'theme'
import { Z_INDEX } from 'theme'

const BaseModal = StyledModal.styled`
  display: flex;
  flex-flow: column nowrap;
  background: ${({ theme }: { theme: any }) => theme.bg0};
  border: 1px solid ${({ theme }: { theme: any }) => theme.border2};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 10px;
  z-index: ${Z_INDEX.modal};
  overflow: hidden;
`

export const MobileModal = styled(BaseModal)`
  width: 100vw;
  height: 100vh;
  border-radius: 0px;
`

export const Modal = styled(BaseModal)<{
  width?: string
}>`
  background: ${({ theme }) => theme.bg0};
  width: clamp(200px, 85%, ${({ width }: { width?: string }) => width ?? '424px'});
`

export const ModalBackground = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${Z_INDEX.modalBackdrop};
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  justify-content: center;
`

const HeaderWrapper = styled.div<{
  border: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  padding: 16px 24px;
  color: ${({ theme }) => theme.text1};
  border-bottom: 1px solid ${({ theme, border }) => (border ? theme.bg2 : 'transparent')};
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

export const ModalHeader = ({
  title,
  border = true,
  onClose,
  onBack,
  hideClose,
}: {
  title?: string
  border?: boolean
  onClose: () => void
  onBack?: () => void
  hideClose?: boolean
}) => {
  return (
    <HeaderWrapper border={border}>
      {onBack && <ChevronLeftIcon onClick={onBack} />}
      {title && <ThemedText.MediumHeader>{title}</ThemedText.MediumHeader>}
      {!hideClose && <CloseIcon size={'1.4rem'} onClick={onClose} />}
    </HeaderWrapper>
  )
}
