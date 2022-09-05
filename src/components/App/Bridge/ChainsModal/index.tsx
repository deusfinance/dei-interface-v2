import React from 'react'
import styled from 'styled-components'

import ChainBox from './ChainBox'
import { ModalHeader, Modal } from 'components/Modal'
import Column from 'components/Column'
import { RowBetween, RowCenter } from 'components/Row'
import { SupportedChainId } from 'constants/chains'

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

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  padding-top: 1rem;
`

const Text = styled(RowCenter)`
  padding-right: 30px;
`

const NotActiveWrapper = styled(RowBetween).attrs({
  align: 'center',
})`
  border-radius: 15px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 64px;
  gap: 10px;
  padding: 0px 1rem;
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.border3};
  background: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

export default function ChainsModal({
  title,
  chains,
  isOpen,
  selectedChain,
  toggleModal,
  handleClick,
}: {
  title: string
  chains: SupportedChainId[]
  isOpen: boolean
  selectedChain: SupportedChainId | null
  toggleModal: (action: boolean) => void
  handleClick: (chainId: SupportedChainId) => void
}) {
  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={title} border={true} />
      <Wrapper>
        <TokenResultWrapper>
          {chains.length ? (
            chains.map((chain, index) => {
              return (
                <ChainBox
                  key={index}
                  chainId={chain}
                  handleClick={handleClick}
                  disabled={selectedChain ? chain === selectedChain : undefined}
                />
              )
            })
          ) : (
            <NotActiveWrapper>
              <Text>No Active Chain</Text>
            </NotActiveWrapper>
          )}
        </TokenResultWrapper>
      </Wrapper>
    </MainModal>
  )
}
