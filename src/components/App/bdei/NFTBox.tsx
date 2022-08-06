import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import BDEI_NFT from '/public/static/images/pages/bdei/BDEI_nft.svg'
import { BondNFT } from 'hooks/useBondsPage'
import { getRemainingTime } from 'utils/time'

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
  nft,
  toggleModal,
  setNFT,
  disabled,
}: {
  nft: BondNFT
  toggleModal: (action: boolean) => void
  setNFT: (tokenId: number) => void
  disabled?: boolean
}) {
  const balanceDisplay = nft.deiAmount
  const [diff, day] = useMemo(() => {
    if (!nft.redeemTime) return [null, null]
    const { diff, day } = getRemainingTime(nft.redeemTime)
    return [diff, day]
  }, [nft])

  // const disabled = !diff || diff > 0
  function getImageSize() {
    return isMobile ? 28 : 36
  }

  return (
    <Wrapper
      onClick={() => {
        toggleModal(false)
        if (!disabled) setNFT(nft.tokenId)
        // if (!disabled) console.log('not disabled')
      }}
    >
      <div>
        <Row>
          <ImageWithFallback src={BDEI_NFT} width={getImageSize()} height={getImageSize()} alt={`nft`} round />
          {/* <TokenId>DeiBond #{nft.tokenId}</TokenId> */}
          <TokenId>#{nft.tokenId}</TokenId>
        </Row>
      </div>
      {/* <Balance>{balanceDisplay ? balanceDisplay : '0.00'}</Balance> */}

      {disabled || true ? (
        <RemainingBox>
          <Balance active={disabled}>{balanceDisplay ? `Redeemable: ${balanceDisplay} bDEI` : '0.00'}</Balance>
          <RemainingDays>in {day} days</RemainingDays>
        </RemainingBox>
      ) : (
        <Balance>{balanceDisplay ? `Redeemable: ${balanceDisplay} bDEI` : '0.00'}</Balance>
      )}
    </Wrapper>
  )
}
