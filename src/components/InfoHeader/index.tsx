import React from 'react'
import styled from 'styled-components'
import { Info } from 'components/Icons'

const Wrapper = styled.div<{ bg?: string }>`
  width: 100%;
  display: flex;
  justify-content: center;
  background: ${({ theme, bg }) => (bg ? (bg === 'gray' ? theme.text3 : bg) : theme.primary6)};
`

const Value = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin: 8px 24px;
`

const CloseIcon = styled.button`
  position: absolute;
  padding: 5px;
  right: 25px;
  cursor: pointer;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 6px;
  `}
`

const InfoIcon = styled(Info)`
  color: ${({ theme }) => theme.white};
  margin-top: 6px;
  margin-right: -15px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: 6px;
  `}
`

export default function InfoHeader({
  text,
  onClose,
  bg,
  hasInfoIcon,
}: {
  text: string
  onClose: (status: boolean) => void
  bg?: string
  hasInfoIcon?: boolean
}) {
  return (
    <Wrapper bg={bg}>
      {hasInfoIcon && <InfoIcon size={20} />}
      <Value>{text}</Value>
      <CloseIcon onClick={() => onClose(false)}>X</CloseIcon>
    </Wrapper>
  )
}
