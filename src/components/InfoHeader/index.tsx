import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background: ${({ theme }) => theme.primary6};
`

const Value = styled.div`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin: 8px 2px;
`

const CloseIcon = styled.button`
  position: absolute;
  padding: 5px;
  right: 30px;
  cursor: pointer;
`

export default function InfoHeader({ text, onClose }: { text: string; onClose: (status: boolean) => void }) {
  return (
    <Wrapper>
      <Value>{text}</Value>
      <CloseIcon onClick={() => onClose(false)}>X</CloseIcon>
    </Wrapper>
  )
}
