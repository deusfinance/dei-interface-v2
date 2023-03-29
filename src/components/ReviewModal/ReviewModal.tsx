import React from 'react'
import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import ArrowDownDark from 'components/Icons/ArrowDownDark'
import Column from 'components/Column'
import { RowCenter } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import InputBox from 'components/InputBox'
import ModalInfo from './ModalInfo'
import LottieDei from 'components/Icons/LottieDei'

const MainModal = styled(Modal)`
  display: flex;
  width: 440px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 24px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 90%;
    max-height: 560px;
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

const AwaitingWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 1.5rem 0;
`

const LottieWrap = styled.div`
  margin-bottom: 30px;
`

const SummaryWrap = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  margin: 20px auto;
  max-width: 350px;
  text-align: center;
`

const ConfirmWrap = styled(SummaryWrap)`
  font-size: 14px;
  margin: 0;
  margin-top: 20px;
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
  font-family: 'IBM Plex Mono';
  color: ${({ theme }) => theme.bg0};
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

const SeparatorLight = styled.div`
  height: 2px;
  background: ${({ theme }) => theme.bg2};
  margin-top: 30px;
`

export default function ReviewModal({
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
  summary,
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
  summary: string
}) {
  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={awaiting ? 'Confirmation' : title} border={false} />
      {awaiting ? (
        <AwaitingWrapper>
          <LottieWrap>
            <LottieDei />
          </LottieWrap>

          <RowCenter>
            <span>Waiting for confirmation...</span>
          </RowCenter>

          <RowCenter>
            <SummaryWrap>{summary}</SummaryWrap>
          </RowCenter>

          <SeparatorLight />

          <RowCenter>
            <ConfirmWrap>Confirm this transaction in your wallet</ConfirmWrap>
          </RowCenter>
        </AwaitingWrapper>
      ) : (
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

            <ArrowDownDark style={{ margin: '16px auto' }} />

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
      )}
      {data && (
        <>
          <Separator />
          <Data>{data}</Data>
        </>
      )}

      {!awaiting && <ConfirmButton onClick={() => handleClick()}>{buttonText}</ConfirmButton>}
    </MainModal>
  )
}
