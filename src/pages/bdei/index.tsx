import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'

import useWeb3React from 'hooks/useWeb3'

import DEI_LOGO from '/public/static/images/pages/bdei/DEI_logo.svg'

import Hero from 'components/Hero'
import { useSearch, SearchField, Table } from 'components/App/bdei'
import LockManager from 'components/App/Vest/LockManager'
import APYManager from 'components/App/Vest/APYManager'
import { RowFixed, RowBetween } from 'components/Row'
import StatsHeader from 'components/StatsHeader'
import { Container, Title } from 'components/App/StableCoin'

import { useOwnerBondNFTs } from 'hooks/useOwnedNfts'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import InfoHeader from 'components/InfoHeader'
import { BondNFT, useUserDeiBondInfo } from 'hooks/useBondsPage'

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1168px);

  & > * {
    &:nth-child(3) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const UpperRow = styled(RowBetween)`
  background: ${({ theme }) => theme.bg0};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  flex-wrap: wrap;

  & > * {
    margin: 10px 10px;
  }
`

const ButtonWrapper = styled(RowFixed)`
  gap: 10px;
  & > * {
    height: 50px;
  }
`

export const ButtonText = styled.span<{ disabled?: boolean }>`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 15px;
  line-height: 17px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}

  ${({ disabled }) =>
    disabled &&
    `
    background: -webkit-linear-gradient(92.33deg, #e29d52 -10.26%, #de4a7b 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

const TopBorderWrap = styled.div<{ active?: any }>`
  background: ${({ theme }) => theme.primary2};
  padding: 1px;
  border-radius: 8px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.bg0};
  flex: 1;

  &:hover {
    border: 1px solid ${({ theme, active }) => (active ? theme.bg0 : theme.warning)};
  }
`

const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 6px;
  height: 100%;
  width: 100%;
  display: flex;
`

const FirstRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
`

const UpperRowMobile = styled(UpperRow)<{ hasSecondRow?: boolean }>`
  /* margin-bottom: ${({ hasSecondRow }) => (hasSecondRow ? '0' : '-20px')}; */
`

export default function BDei() {
  const { chainId, account } = useWeb3React()
  const [showLockManager, setShowLockManager] = useState(false)
  const isSupportedChainId = useSupportedChainId()
  const [showAPYManager, setShowAPYManager] = useState(false)
  const [nftId, setNftId] = useState(0)
  // const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const addTransaction = useTransactionAdder()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useIsTransactionPending(pendingTxHash)

  const ownedNfts = useOwnerBondNFTs()
  const nftIds = ownedNfts.results

  const [showTopBanner, setShowTopBanner] = useState(false)

  const { snapshot, searchProps } = useSearch()
  const result = snapshot.options.map((nft) => nft)
  const snapshotList = useMemo(() => {
    return result.map((obj: any) => {
      return { tokenId: obj?.tokenId, redeemTime: obj?.redeemTime, deiAmount: obj?.deiAmount }
    })
  }, [snapshot])

  useEffect(() => {
    setShowLockManager(false)
    setShowAPYManager(false)
  }, [chainId, account])

  const toggleLockManager = (nftId: number) => {
    setShowLockManager(true)
    setShowAPYManager(false)
    setNftId(nftId)
  }

  const toggleAPYManager = (nftId: number) => {
    setShowLockManager(false)
    setShowAPYManager(true)
    setNftId(nftId)
  }

  function getUpperRow() {
    return (
      <UpperRow>
        <div>
          <SearchField searchProps={searchProps} />
        </div>
      </UpperRow>
    )
  }

  function getUpperRowMobile() {
    return (
      <UpperRowMobile hasSecondRow={!!snapshotList.length}>
        <FirstRowWrapper>
          <SearchField searchProps={searchProps} />
        </FirstRowWrapper>
      </UpperRowMobile>
    )
  }

  const userStats = useUserDeiBondInfo()

  const items = useMemo(() => [{ name: 'Total DEI Claimed', value: '0' }, ...userStats], [userStats])

  return (
    <Container>
      {showTopBanner && (
        <InfoHeader onClose={setShowTopBanner} text={'Some random text! some random text! some random text!'} />
      )}
      <Hero>
        <Image src={DEI_LOGO} width={'76px'} height={'90px'} alt="Logo" />
        <Title>DEI Bond</Title>
        <StatsHeader items={items} />
      </Hero>
      <Wrapper>
        {isMobile ? getUpperRowMobile() : getUpperRow()}

        <Table
          nfts={snapshotList as BondNFT[]}
          toggleLockManager={toggleLockManager}
          toggleAPYManager={toggleAPYManager}
          isMobile={isMobile}
          isLoading={ownedNfts.isLoading}
        />
      </Wrapper>
      <LockManager isOpen={showLockManager} onDismiss={() => setShowLockManager(false)} nftId={nftId} />
      <APYManager
        isOpen={showAPYManager}
        onDismiss={() => setShowAPYManager(false)}
        nftId={nftId}
        toggleLockManager={toggleLockManager}
      />
    </Container>
  )
}
