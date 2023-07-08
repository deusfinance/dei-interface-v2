import React from 'react'
import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'
import Column from 'components/Column'
import { Row } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import InputBox from './InputBox'
import { Title } from '.'
// import { DEUS_TOKEN } from 'constants/tokens'
// import { formatUnits } from '@ethersproject/units'
// import { toBN } from 'utils/numbers'

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
  userDeusAmount,
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
  userDeusAmount: string
}) {
  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={title} border={false} />
      <Wrapper>
        {userDeusAmount && (
          <TokenResultWrapper>
            {inputTokens.map((token, index) => (
              <InputBox
                key={index}
                currency={token}
                // maxValue={formatUnits(userDeusAmount?.toString(), DEUS_TOKEN.decimals)}
                value={amountIn}
                onChange={(value: string) => setAmountIn(value)}
              />
            ))}

            <div style={{ paddingTop: '10px', paddingBottom: '65px' }}>
              {outputTokens.map((token, index) => (
                <Row key={index} style={{ paddingTop: '10px' }}>
                  <Title>Claimable {token.name}:</Title>
                  {/* <Value>
                    {toBN(formatUnits(userDeusAmount?.toString(), DEUS_TOKEN.decimals)).toFixed(6).toString()}
                  </Value> */}
                </Row>
              ))}
            </div>
          </TokenResultWrapper>
        )}
      </Wrapper>

      {!amountIn ? (
        <ConfirmButton disabled>{buttonText}</ConfirmButton>
      ) : (
        <ConfirmButton onClick={() => handleClick()}>{buttonText}</ConfirmButton>
      )}
    </MainModal>
  )
}
