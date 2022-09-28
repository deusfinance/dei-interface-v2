import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import { ModalHeader, Modal } from 'components/Modal'
import ARROWUP from '/public/static/images/ArrowUp.svg'

import { RowCenter } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'

const MainModal = styled(Modal)`
  display: flex;
  width: 440px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
  `};
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  margin: 0 15px;
  gap: 0.8rem;
  padding: 1.5rem 0;
  overflow-y: scroll;
  height: auto;
`

const Data = styled(RowCenter)`
  font-family: 'IBM Plex Mono';
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  width: 100%;
  margin-left: 10px;
  padding: 5px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`
const ConfirmButton = styled(PrimaryButton)`
  height: 62px;
  max-width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
  border-radius: 12px;
`

export default function UpdateModal({
  title,
  isOpen,
  buttonText,
  toggleModal,
  handleClick,
  awaiting,
}: {
  title: string
  isOpen: boolean
  buttonText: string
  toggleModal: (action: boolean) => void
  handleClick: () => void
  awaiting?: boolean
}) {
  return (
    <>
      <MainModal
        isOpen={isOpen}
        onBackgroundClick={() => toggleModal(false)}
        onEscapeKeydown={() => toggleModal(false)}
      >
        <ModalHeader onClose={() => toggleModal(false)} title={title} border={false} />
        <Wrapper>
          <Image src={ARROWUP} width={'112px'} height={'112px'} alt="Arrow-up" />
          <Data>Update oracle to continue...</Data>
        </Wrapper>
        <ConfirmButton onClick={() => handleClick()}>
          {buttonText} {awaiting ? <DotFlashing /> : <></>}
        </ConfirmButton>
      </MainModal>
    </>
  )
}
