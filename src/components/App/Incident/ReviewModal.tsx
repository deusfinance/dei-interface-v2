import React from 'react'
import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import Column from 'components/Column'
import { Row } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import InputBox from './InputBox'
import { Title, Value } from '.'
import { DEUS_TOKEN } from 'constants/tokens'

const MainModal = styled(Modal)`
  display: flex;
  width: 440px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 24px;
  font-family: Inter;

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
  padding-bottom: 1.5rem;
  overflow-y: scroll;
  height: auto;
`
const TokenResultWrapper = styled(Column)`
  gap: 8px;
  padding-top: 1rem;
`
const ConfirmButton = styled(PrimaryButton)`
  height: 52px;
  max-width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
  border-radius: 12px;
`

export default function ReviewModal({
  title,
  inputTokens,
  outputTokens,
  amountIn,
  setAmountIn,
  isOpen,
  buttonText,
  toggleModal,
  handleClick,
  userReimbursableData,
}: {
  title: string
  inputTokens: Token[]
  outputTokens: Token[]
  amountIn: string
  setAmountIn: (action: string) => void
  isOpen: boolean
  buttonText: string
  toggleModal: (action: boolean) => void
  handleClick: () => void
  userReimbursableData: any
}) {
  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={title} border={false} />
      <Wrapper>
        <TokenResultWrapper>
          {inputTokens.map((token, index) => (
            <InputBox key={index} currency={token} value={amountIn} onChange={(value: string) => setAmountIn(value)} />
          ))}

          <div style={{ paddingTop: '10px', paddingBottom: '65px' }}>
            {outputTokens.map((token, index) => (
              <Row key={index} style={{ paddingTop: '10px' }}>
                <Title>Claimable {token.name}:</Title>
                <Value>
                  {token.name === DEUS_TOKEN.name ? userReimbursableData?.data?.deus : userReimbursableData?.data?.usdc}
                </Value>
              </Row>
            ))}
          </div>
        </TokenResultWrapper>
      </Wrapper>

      <ConfirmButton onClick={() => handleClick()}>{buttonText}</ConfirmButton>
    </MainModal>
  )
}
