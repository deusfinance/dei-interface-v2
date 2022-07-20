import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { BorrowAction } from 'state/borrow/reducer'
import { useBorrowPoolFromURL, useCurrenciesFromPool } from 'state/borrow/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { Borrow, Balances, Info, Position } from 'components/App/Borrow'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { PrimaryButton } from 'components/Button'
import { ArrowBubble } from 'components/Icons'
import { useRouter } from 'next/router'
import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { SupportedChainId } from 'constants/chains'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 750px);
  gap: 10px;
`

const ReturnWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
  font-size: 0.9rem;
  margin-bottom: 20px;

  &:hover {
    cursor: pointer;
  }

  & > * {
    &:first-child {
      transform: rotate(90deg);
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-bottom: 5px;
  `}
`

const Navigation = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 1px;
  margin-bottom: 30px;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  gap: 15px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
  `}
`

const BorrowButton = styled(PrimaryButton)`
  width: 180px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     width: fit-content;
  `}
`

const CardWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: 10px;
  & > * {
    flex: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column nowrap;
  `}
`

export default function BorrowDEI() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()
  const pool = useBorrowPoolFromURL()
  const { collateralCurrency, borrowCurrency } = useCurrenciesFromPool(pool ?? undefined)
  const [selectedAction, setSelectedAction] = useState<BorrowAction>(BorrowAction.REPAY)
  const isSupportedChainId = useSupportedChainId()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const onReturnClick = useCallback(() => {
    router.push('/borrow')
  }, [router])

  function getMainContent() {
    if (!chainId || !account) {
      return (
        <>
          <div>Connect your Wallet in order to start borrowing.</div>
          <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
        </>
      )
    }
    if (!isSupportedChainId) {
      return (
        <>
          <div>You are not connected to the Fantom Opera Network.</div>
          <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
        </>
      )
    }
    if (!pool) {
      return <div>The imported contract is not a valid pool. Return to Pool Overview for a valid list.</div>
    }

    if (!collateralCurrency || !borrowCurrency) {
      return (
        <div>
          Experiencing issues with the Fantom RPC, unable to load this pool. If this issue persist, try to refresh the
          page.
        </div>
      )
    }

    return (
      <>
        <Navigation>
          <BorrowButton
            disabled={selectedAction !== BorrowAction.BORROW}
            onClick={() => setSelectedAction(BorrowAction.BORROW)}
          >
            {BorrowAction.BORROW}
          </BorrowButton>
          <BorrowButton
            disabled={selectedAction !== BorrowAction.REPAY}
            onClick={() => setSelectedAction(BorrowAction.REPAY)}
          >
            {BorrowAction.REPAY}
          </BorrowButton>
        </Navigation>
        <CardWrapper>
          <Borrow pool={pool} action={selectedAction} />
          <Position pool={pool} />
        </CardWrapper>
        <CardWrapper>
          <Balances pool={pool} />
          <Info pool={pool} />
        </CardWrapper>
      </>
    )
  }

  return (
    <Container>
      <Hero>
        <div>Borrow {borrowCurrency?.symbol}</div>
        <HeroSubtext>
          {pool?.contract.name} | {pool?.type}
        </HeroSubtext>
      </Hero>
      <Wrapper>
        <ReturnWrapper onClick={onReturnClick}>
          <ArrowBubble size={20} />
          Pool Overview
        </ReturnWrapper>
        {getMainContent()}
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
