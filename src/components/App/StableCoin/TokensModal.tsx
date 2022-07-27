import { useMemo } from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'

import { Modal, ModalHeader } from 'components/Modal'
import { SearchField, useSearch } from 'components/App/StableCoin/Search'
import TokenBox from 'components/App/StableCoin/TokenBox'
import Column from 'components/Column'
import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { Plus } from 'react-feather'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.8rem;
  padding: 0px 0px 28px 0px;

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
  border-top: 1px solid ${({ theme }) => theme.border1};
  padding: 1rem 9px;
  padding-bottom: 0;
`

const ComboWrapper = styled(Column)<{ disabled?: boolean }>`
  border: 1px solid ${({ theme, disabled }) => (disabled ? theme.bg2 : theme.border3)};
  border-radius: 12px;

  &:hover {
    background: ${({ theme, disabled }) => (disabled ? theme.bg1 : theme.bg3)};
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  }

  & > * {
    &:nth-child(1) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:nth-child(3) {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
`

const PlusIcon = styled(Plus)`
  margin: -14px auto;
  margin-left: 48px;
  z-index: 1000;
  padding: 3px;
  border: 1px solid ${({ theme }) => theme.bg4};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text2};
`

export default function TokensModal({
  isOpen,
  toggleModal,
  selectedToken,
  setToken,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  selectedToken: number
  setToken: (index: number) => void
}) {
  const tokens = useMemo(() => [[DEI_TOKEN], [USDC_TOKEN], [USDC_TOKEN, DEUS_TOKEN]], [])
  // const { snapshot, searchProps } = useSearch(tokens)
  // const result = snapshot.options.map((token) => token)

  return (
    <Modal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title="Select a Token" />
      <Wrapper>
        {/* <SearchField searchProps={searchProps} /> */}
        <TokenResultWrapper>
          {/* {result.map((token, index) => {
            if ((selectedToken as Token)?.address === (token as unknown as Token)?.address) return
            return (
              <TokenBox
                key={index}
                toggleModal={toggleModal}
                currency={token as unknown as Currency}
                setToken={setToken}
              />
            )
          })} */}
          {tokens.map((token, index) => {
            if (token.length > 1)
              return (
                <ComboWrapper disabled={index === 2}>
                  <TokenBox
                    key={index}
                    index={index}
                    toggleModal={toggleModal}
                    currency={token[0]}
                    setToken={setToken}
                    // disabled={index === 2}
                  />
                  <PlusIcon size={24} />
                  <TokenBox
                    key={index}
                    index={index}
                    toggleModal={toggleModal}
                    currency={token[1]}
                    setToken={setToken}
                    // disabled={index === 2}
                  />
                </ComboWrapper>
              )
            return (
              <TokenBox
                key={index}
                index={index}
                toggleModal={toggleModal}
                currency={token[0]}
                setToken={setToken}
                disabled={index < 1}
              />
            )
          })}
        </TokenResultWrapper>
      </Wrapper>
    </Modal>
  )
}
