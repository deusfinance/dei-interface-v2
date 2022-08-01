import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import useWeb3React from 'hooks/useWeb3'
import BDEI_NFT from '/public/static/images/pages/bdei/BDEI_nft.svg'

import ImageWithFallback from 'components/ImageWithFallback'
import { RowBetween } from 'components/Row'

const Wrapper = styled(RowBetween).attrs({
  align: 'center',
})`
  display: flex;
  border-radius: 15px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  min-height: 60px;
  gap: 10px;
  padding: 0px 1rem;
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.border3};
  background: ${({ theme }) => theme.bg1};
  &:hover {
    background: ${({ theme }) => theme.bg3};
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  font-size: 1.5rem;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 3px;
  `}
`

const Balance = styled.div<{ active?: boolean }>`
  font-size: 12px;
  text-align: center;
  color: ${({ theme, active }) => (active ? theme.text2 : theme.text1)};
`

const TokenId = styled.p`
  margin-left: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
`

const RemainingBox = styled.div`
  display: block;
  text-align: right;
`

const RemainingDays = styled.p`
  font-weight: 500;
  font-size: 12px;

  color: ${({ theme }) => theme.yellow4};
`

export default function NFTBox({
  tokenId,
  toggleModal,
  setNFT,
  disabled,
}: {
  tokenId: number
  toggleModal: (action: boolean) => void
  setNFT: (tokenId: number) => void
  disabled?: boolean
}) {
  const { account } = useWeb3React()
  //   TODO: correct balance
  //   const nftBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  //   const balanceDisplay = useMemo(() => nftBalance?.toSignificant(6), [nftBalance])
  const balanceDisplay = 102131

  function getImageSize() {
    return isMobile ? 28 : 36
  }

  return (
    <Wrapper
      onClick={() => {
        toggleModal(false)
        if (!disabled) setNFT(tokenId)
        // if (!disabled) console.log('not disabled')
      }}
    >
      <div>
        <Row>
          <ImageWithFallback src={BDEI_NFT} width={getImageSize()} height={getImageSize()} alt={`nft`} round />
          <TokenId>#{tokenId}</TokenId>
        </Row>
      </div>
      {/* <Balance>{balanceDisplay ? balanceDisplay : '0.00'}</Balance> */}

      {disabled ? (
        <RemainingBox>
          <Balance active={disabled}>{balanceDisplay ? `Redeemable: ${balanceDisplay} bDEI` : '0.00'}</Balance>
          <RemainingDays>in 13 days</RemainingDays>
        </RemainingBox>
      ) : (
        <Balance>{balanceDisplay ? `Redeemable: ${balanceDisplay} bDEI` : '0.00'}</Balance>
      )}
    </Wrapper>
  )
}
