import { useMemo } from 'react'
import styled from 'styled-components'

import { Modal, ModalHeader } from 'components/Modal'
// import { SearchField, useSearch } from 'components/App/Vest/Search'
import Column from 'components/Column'
import NFTBox from 'components/App/bdei/NFTBox'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.8rem;
  /* padding: 1.5rem 0; */
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
  padding: 1rem 0px;
  padding-bottom: 0;
`

export default function NFTsModal({
  isOpen,
  toggleModal,
  selectedNFT,
  setNFT,
}: {
  isOpen: boolean
  toggleModal: (action: boolean) => void
  selectedNFT: number
  setNFT: (tokenId: number) => void
}) {
  const nfts = useMemo(() => [], [])
  // TODO: use vest search
  // const { snapshot, searchProps } = useSearch(nfts)
  // const result = snapshot.options.map((nft) => nft)
  const result = [10, 11, 12, 13, 15]

  return (
    <Modal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title="Select a NFT" />
      <Wrapper>
        {/* <SearchField searchProps={searchProps} modalSearch={true} /> */}
        <TokenResultWrapper>
          {result.map((nft, index) => {
            if (selectedNFT === nft) return
            return <NFTBox key={index} toggleModal={toggleModal} tokenId={nft} setNFT={setNFT} disabled={index < 2} />
          })}
        </TokenResultWrapper>
      </Wrapper>
    </Modal>
  )
}
