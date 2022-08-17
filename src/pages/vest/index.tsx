import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import toast from 'react-hot-toast'

import veDEUS_LOGO from '/public/static/images/pages/veDEUS/veDEUS.svg'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'
import { DefaultHandlerError } from 'utils/parseError'

import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'
import { useVeDistContract } from 'hooks/useContract'
import { useOwnerVeDeusNFTs } from 'hooks/useOwnerNfts'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useDistRewards from 'hooks/useDistRewards'

import Hero from 'components/Hero'
import { PrimaryButtonWide } from 'components/Button'
import { RowFixed, RowBetween } from 'components/Row'
import StatsHeader from 'components/StatsHeader'
import { Container } from 'components/App/StableCoin'
import { useSearch, SearchField, Table } from 'components/App/Vest'
import LockManager from 'components/App/Vest/LockManager'
import APYManager from 'components/App/Vest/APYManager'

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

export const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}

  ${({ gradientText }) =>
    gradientText &&
    `
    background: -webkit-linear-gradient(92.33deg, #e29d52 -10.26%, #de4a7b 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

export const TopBorderWrap = styled.div<{ active?: boolean }>`
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

export const TopBorder = styled.div`
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

export default function Vest() {
  const { chainId, account } = useWeb3React()
  const [showLockManager, setShowLockManager] = useState(false)
  const [showAPYManager, setShowAPYManager] = useState(false)
  const [nftId, setNftId] = useState(0)
  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()
  const addTransaction = useTransactionAdder()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useIsTransactionPending(pendingTxHash)
  const isSupportedChainId = useSupportedChainId()
  const veDistContract = useVeDistContract()
  const ownedNfts = useOwnerVeDeusNFTs()
  const nftIds = ownedNfts.results
  const rewards = useDistRewards()
  const toggleWalletModal = useWalletModalToggle()

  // const [showTopBanner, setShowTopBanner] = useState(false)

  const { snapshot, searchProps } = useSearch()
  const snapshotList = useMemo(() => {
    return snapshot.options.map((obj) => {
      return obj.value
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

  const [unClaimedIds, totalRewards] = useMemo(() => {
    if (!nftIds.length || !rewards.length) return [[], 0]
    let total = 0
    return [
      rewards.reduce((acc: number[], value: number, index: number) => {
        if (!value) return acc
        acc.push(nftIds[index])
        total += value
        return acc
      }, []),
      total,
    ]
  }, [nftIds, rewards])

  const onClaimAll = useCallback(async () => {
    try {
      if (awaitingConfirmation || showTransactionPending || !totalRewards) return
      if (!veDistContract || !account || !isSupportedChainId || !unClaimedIds.length) return
      setAwaitingConfirmation(true)
      const response = await veDistContract.claimAll(unClaimedIds)
      addTransaction(response, { summary: `Claim All veDEUS rewards`, vest: { hash: response.hash } })
      setAwaitingConfirmation(false)
      setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [
    awaitingConfirmation,
    showTransactionPending,
    totalRewards,
    veDistContract,
    account,
    isSupportedChainId,
    unClaimedIds,
    addTransaction,
  ])

  function getClaimAllButton() {
    if (!snapshotList.length || !totalRewards) return
    let text = ''
    if (awaitingConfirmation) text = 'Confirming...'
    else if (showTransactionPending) text = 'Claiming...'
    else if (totalRewards) text = `Claim all ${formatAmount(totalRewards)} veDEUS`

    if (isMobile) {
      return (
        <PrimaryButtonWide style={{ marginTop: '2px', marginBottom: '12px' }} onClick={onClaimAll}>
          <ButtonText>{text}</ButtonText>
        </PrimaryButtonWide>
      )
    } else {
      return (
        <PrimaryButtonWide onClick={onClaimAll}>
          <ButtonText>{text}</ButtonText>
        </PrimaryButtonWide>
      )
    }
  }

  function getMainContent() {
    return !account ? (
      <TopBorderWrap>
        <TopBorder>
          <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
            <ButtonText gradientText>Connect Wallet</ButtonText>
          </PrimaryButtonWide>
        </TopBorder>
      </TopBorderWrap>
    ) : !!snapshotList.length ? (
      <TopBorderWrap>
        <TopBorder>
          <Link href="/vest/create" passHref>
            <PrimaryButtonWide transparentBG padding={'1rem'}>
              <ButtonText gradientText>Create Lock</ButtonText>
            </PrimaryButtonWide>
          </Link>
        </TopBorder>
      </TopBorderWrap>
    ) : (
      <PrimaryButtonWide>
        <Link href="/vest/create" passHref>
          <ButtonText>Create New Lock</ButtonText>
        </Link>
      </PrimaryButtonWide>
    )
  }

  function getUpperRow() {
    if (isMobile) {
      return (
        <UpperRow>
          <FirstRowWrapper>
            <SearchField searchProps={searchProps} />
            {getMainContent()}
          </FirstRowWrapper>
          {getClaimAllButton()}
        </UpperRow>
      )
    } else {
      return (
        <UpperRow>
          <div>
            <SearchField searchProps={searchProps} />
          </div>
          <ButtonWrapper>
            {getClaimAllButton()}
            {getMainContent()}
          </ButtonWrapper>
        </UpperRow>
      )
    }
  }

  const items = useMemo(
    () => [
      { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusPrice), 2) },
      { name: 'veDEUS Supply', value: formatAmount(parseFloat(lockedVeDEUS), 0) },
    ],
    [deusPrice, lockedVeDEUS]
  )

  return (
    <Container>
      {/* {showTopBanner && (
        <InfoHeader onClose={setShowTopBanner} text={'Some random text! some random text! some random text!'} />
      )} */}
      <Hero>
        <Image src={veDEUS_LOGO} height={'90px'} alt="Logo" />
        <StatsHeader items={items} hasBox />
      </Hero>
      <Wrapper>
        {getUpperRow()}
        <Table
          nftIds={snapshotList as number[]}
          toggleLockManager={toggleLockManager}
          toggleAPYManager={toggleAPYManager}
          isMobile={isMobile}
          rewards={rewards}
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
