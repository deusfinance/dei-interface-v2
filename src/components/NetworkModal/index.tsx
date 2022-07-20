import React, { useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { darken } from 'polished'

import { useModalOpen, useNetworkModalToggle } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

import { SupportedChainId, SolidlyChains } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'
import { Modal, ModalHeader } from 'components/Modal'
import { IconWrapper, GreenCircle } from 'components/Icons'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.8rem;
  padding: 1.5rem;
  overflow-y: auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const Option = styled.div<{
  active?: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  font-size: 1.1rem;
  border-radius: 10px;
  outline: none;
  align-items: center;
  padding: 0.6rem;
  border: 1px solid transparent;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.9rem;
  `};

  ${({ theme, active }) =>
    active
      ? `
    background: ${darken(0.07, theme.bg1)};
    &:hover,
    &:focus {
      cursor: default;
    }
  `
      : `
    background: ${theme.bg1};
    &:hover,
    &:focus {
      cursor: pointer;
      border: 1px solid ${theme.secondary1};
    }
  `}

  & > * {
    &:last-child {
      margin-left: auto;
    }
  }
`

export default function NetworkModal() {
  const { chainId } = useWeb3React()
  const modalOpen = useModalOpen(ApplicationModal.NETWORK)
  const toggleModal = useNetworkModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const chainMap = useMemo(() => {
    return Object.values(SolidlyChains).reduce((acc: SupportedChainId[], id: SupportedChainId, index, arr) => {
      if (chainId === id) {
        return [id, ...acc]
      }

      // Insert connected chain, accepting outsiders
      if (chainId && index === arr.length - 1) {
        acc.push(id)
        return acc.includes(chainId) ? acc : [chainId, ...acc]
      }
      return [...acc, id]
    }, [])
  }, [chainId])

  return (
    <Modal isOpen={modalOpen} onBackgroundClick={toggleModal} onEscapeKeydown={toggleModal}>
      <ModalHeader onClose={toggleModal} title="Select a Network" />
      <Wrapper>
        {chainMap.map((id, index) => {
          const active = chainId == id
          const Chain = ChainInfo[id]
          return (
            <Option
              key={index}
              active={active}
              onClick={() => {
                if (active) return
                toggleModal()
                rpcChangerCallback(id)
              }}
            >
              {active && (
                <IconWrapper>
                  <GreenCircle />
                </IconWrapper>
              )}
              <div style={{ marginRight: 'auto' }}>{Chain.label}</div>
              <Image src={Chain.logoUrl} alt={Chain.label} width={30} height={30} />
            </Option>
          )
        })}
      </Wrapper>
    </Modal>
  )
}
