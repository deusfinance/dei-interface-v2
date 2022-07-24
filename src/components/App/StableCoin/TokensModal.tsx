import { useMemo } from 'react'
import styled from 'styled-components'
import { Currency, Token } from '@sushiswap/core-sdk'

import { Modal, ModalHeader } from 'components/Modal'
import { SearchField, useSearch } from 'components/App/StableCoin/Search'
import TokenBox from 'components/App/StableCoin/TokenBox'
import Column from 'components/Column'
import { DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'

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

export default function TokensModal({
  isOpen,
  toggleModal,
  selectedToken,
  setToken,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  selectedToken: Currency
  setToken: (currency: Currency) => void
}) {
  const tokens = useMemo(() => [DEI_TOKEN, USDC_TOKEN], [])
  const { snapshot, searchProps } = useSearch(tokens)
  const result = snapshot.options.map((token) => token)

  return (
    <Modal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title="Select a Token" />
      <Wrapper>
        <SearchField searchProps={searchProps} />
        <TokenResultWrapper>
          {result.map((token, index) => {
            if ((selectedToken as Token)?.address === (token as unknown as Token)?.address) return
            return (
              <TokenBox
                key={index}
                toggleModal={toggleModal}
                currency={token as unknown as Currency}
                setToken={setToken}
              />
            )
          })}
        </TokenResultWrapper>
      </Wrapper>
    </Modal>
  )
}
