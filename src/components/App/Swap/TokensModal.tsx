import styled from 'styled-components'

import { Modal, ModalHeader } from 'components/Modal'
import TokenBox from 'components/App/StableCoin/TokenBox'
import Column from 'components/Column'
import { Token } from '@sushiswap/core-sdk'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.8rem;
  padding: 0px 0px 28px 0px;
  /* width: 424px; */
  height: 433px;
  overflow: scroll;

  & > * {
    &:first-child {
      width: unset;
      margin: 0 9px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  /* border-top: 1px solid ${({ theme }) => theme.border1}; */
  padding: 1rem 9px;
  padding-bottom: 0;
`

export default function TokensModal({
  isOpen,
  toggleModal,
  selectedTokenIndex,
  setToken,
  tokens,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  selectedTokenIndex: number
  setToken: (index: number) => void
  tokens: Token[]
}) {
  return (
    <Modal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title="Select a Token" />
      <Wrapper>
        <TokenResultWrapper>
          {tokens.map((token, index) => {
            return (
              <TokenBox
                key={index}
                index={index}
                toggleModal={toggleModal}
                currency={token}
                setToken={setToken}
                disabled={index === selectedTokenIndex}
              />
            )
          })}
        </TokenResultWrapper>
      </Wrapper>
    </Modal>
  )
}
