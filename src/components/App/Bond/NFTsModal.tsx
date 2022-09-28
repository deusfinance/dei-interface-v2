import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import Disabled_BDEI_NFT from '/public/static/images/pages/bond/Disabled_BDEI_nft.svg'

import { Modal, ModalHeader } from 'components/Modal'
import Column from 'components/Column'
import { RowBetween, RowCenter } from 'components/Row'
import ImageWithFallback from 'components/ImageWithFallback'
import { SearchField, useSearch } from 'components/App/Bond/Search'
import NFTBox from 'components/App/Bond/NFTBox'
import { BondNFT } from 'hooks/useBondsPage'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 16px 12px;
  max-height: 400px;
  overflow-y: auto;
  & > * {
    &:first-child {
      width: unset;
      margin: 0 9px;
      min-height: 54px;
      margin-bottom: 12px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const NotFoundWrapper = styled(RowBetween).attrs({
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

const Text = styled(RowCenter)`
  padding-right: 30px;
`

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  border-top: 1px solid ${({ theme }) => theme.border1};
  padding: 1rem 9px;
  padding-bottom: 0;
  overflow-y: auto;
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
  const { snapshot, searchProps } = useSearch()
  const result = snapshot.options.map((nft) => nft)

  function getImageSize() {
    return isMobile ? 28 : 36
  }

  return (
    <Modal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title="Select a NFT" />
      <Wrapper>
        <SearchField searchProps={searchProps} modalSearch={true} />
        <TokenResultWrapper>
          {result.length ? (
            result.map((nft: any, index) => {
              return (
                <NFTBox
                  key={index}
                  toggleModal={toggleModal}
                  nft={{ tokenId: nft?.tokenId, redeemTime: nft?.redeemTime, deiAmount: nft?.deiAmount } as BondNFT}
                  setNFT={setNFT}
                  disabled={nft.value === selectedNFT}
                />
              )
            })
          ) : (
            <NotFoundWrapper>
              <ImageWithFallback
                src={Disabled_BDEI_NFT}
                width={getImageSize()}
                height={getImageSize()}
                alt={`nft`}
                round
              />
              <Text>NFT Not FOUND</Text>
            </NotFoundWrapper>
          )}
        </TokenResultWrapper>
      </Wrapper>
    </Modal>
  )
}
