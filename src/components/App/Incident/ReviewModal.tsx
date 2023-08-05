import React from 'react'
import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import Column from 'components/Column'
import { Row } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import InputBox from './InputBox'
import { ModalType, Title, Value } from '.'
import BigNumber from 'bignumber.js'
import { BN_ZERO, toBN } from 'utils/numbers'
import { DotFlashing } from 'components/Icons'

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
  ratio,
  modalType,
  awaiting,
}: {
  title: string
  inputTokens: Token[]
  outputTokens: Token[]
  amountIn: string
  setAmountIn: (action: string) => void
  isOpen: boolean
  buttonText: string
  toggleModal: (action?: ModalType) => void
  handleClick: () => void
  userReimbursableData: BigNumber
  ratio: number
  modalType: ModalType
  awaiting: boolean
}) {
  const mainClaimableAmount =
    modalType === ModalType.bDEI ? userReimbursableData : userReimbursableData.times(toBN(ratio))
  const bDEIAmount = modalType === ModalType.bDEI ? BN_ZERO : userReimbursableData.times(toBN(1 - ratio))

  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal()} onEscapeKeydown={() => toggleModal()}>
      <ModalHeader onClose={() => toggleModal()} title={title} border={false} />
      <Wrapper>
        {userReimbursableData && (
          <TokenResultWrapper>
            {inputTokens.map((token, index) => (
              <InputBox
                key={index}
                currency={token}
                maxValue={userReimbursableData?.toString()}
                value={amountIn}
                onChange={(value: string) => setAmountIn(value)}
              />
            ))}

            {mainClaimableAmount && bDEIAmount && (
              <div style={{ paddingTop: '10px', paddingBottom: '65px' }}>
                {outputTokens.map((token, index) => (
                  <Row key={index} style={{ paddingTop: '10px' }}>
                    <Title>Claimable {token.name}:</Title>
                    <Value>
                      {modalType !== ModalType.bDEI
                        ? mainClaimableAmount.toFixed(6).toString()
                        : bDEIAmount.toFixed(4).toString()}
                    </Value>
                  </Row>
                ))}
              </div>
            )}
          </TokenResultWrapper>
        )}
      </Wrapper>

      {!amountIn || !toBN(amountIn).isGreaterThan(BN_ZERO) ? (
        <ConfirmButton disabled>{buttonText}</ConfirmButton>
      ) : toBN(amountIn).isGreaterThan(toBN(userReimbursableData?.toString())) ? (
        <ConfirmButton disabled>Insufficient Balance</ConfirmButton>
      ) : (
        <ConfirmButton onClick={() => handleClick()}>
          {buttonText} {awaiting && <DotFlashing />}
        </ConfirmButton>
      )}
    </MainModal>
  )
}
