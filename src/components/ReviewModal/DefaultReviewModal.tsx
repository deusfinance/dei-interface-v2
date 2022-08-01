import React from 'react'
import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import ArrowDownDark from 'components/Icons/ArrowDownDark'
import Column from 'components/Column'
import ModalInfo from './ModalInfo'
import { RowCenter } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'

const MainModal = styled(Modal)`
  display: flex;
  width: 440px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
    height: 560px;
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

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  padding-top: 1rem;
`

const Data = styled(RowCenter)`
  font-style: italic;
  font-weight: 300;
  font-size: 12px;
  line-height: 14px;
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

const Separator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border2};
`

export default function DefaultReviewModal({
  title,
  inputTokens,
  outputTokens,
  amountsIn,
  amountsOut,
  isOpen,
  info,
  data,
  buttonText,
  toggleModal,
  handleClick,
  awaiting,
}: {
  title: string
  inputTokens: Token[]
  outputTokens: Token[]
  amountsIn: string[]
  amountsOut: string[]
  isOpen: boolean
  info: { title: string; value: string }[]
  data: string | null
  buttonText: string
  toggleModal: (action: boolean) => void
  handleClick: () => void
  awaiting: boolean
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
          <TokenResultWrapper>
            {inputTokens.map((token, index) =>
              amountsIn[index] === '' ? (
                <div style={{ display: 'none' }} key={index}></div>
              ) : (
                <InputBox
                  key={index}
                  currency={token}
                  value={amountsIn[index]}
                  onChange={() => console.log()}
                  disabled={true}
                />
              )
            )}

            <ArrowDownDark size={14} style={{ margin: '16px auto' }} />

            {outputTokens.map((token, index) =>
              amountsOut[index] === '0' ? (
                <div style={{ display: 'none' }} key={index}></div>
              ) : (
                <InputBox
                  key={index}
                  currency={token}
                  value={amountsOut[index]}
                  onChange={() => console.log()}
                  disabled={true}
                />
              )
            )}
          </TokenResultWrapper>
          <ModalInfo info={info} />
        </Wrapper>

        {data && (
          <>
            <Separator />
            <Data>{data}</Data>
          </>
        )}

        <ConfirmButton onClick={() => handleClick()}>
          {buttonText} {awaiting ? <DotFlashing style={{ marginLeft: '10px' }} /> : <></>}
        </ConfirmButton>
      </MainModal>
    </>
  )
}
