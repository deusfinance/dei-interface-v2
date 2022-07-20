import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'

import { useVeDistContract } from 'hooks/useContract'
import useOwnedNfts from 'hooks/useOwnedNfts'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useWeb3React from 'hooks/useWeb3'
import useDistRewards from 'hooks/useDistRewards'

import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Reward'
import { RowEnd } from 'components/Row'
import Box from 'components/Box'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1200px);

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

const UpperRow = styled(RowEnd)`
  gap: 10px;
  margin-bottom: 10px;
  height: 50px;
  & > * {
    height: 100%;
    max-width: fit-content;
    &:first-child {
      max-width: 220px;
      margin-right: auto;
    }
    &:last-child {
      max-width: 200px;
    }

    ${({ theme }) => theme.mediaWidth.upToMedium`
      &:nth-child(2) {
        display: none;
      }
    `}
    ${({ theme }) => theme.mediaWidth.upToSmall`
      &:nth-child(3) {
        display: none;
      }
      flex: 1;
      max-width: none;
    `}
  }
`

export default function Rewards() {
  const { account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const isSupportedChainId = useSupportedChainId()
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useIsTransactionPending(pendingTxHash)
  const deusPrice = useDeusPrice()
  const veDistContract = useVeDistContract()
  const nftIds = useOwnedNfts()
  const rewards = useDistRewards()

  //pass just unclaimed tokenIds to claimAll method
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
  }, [veDistContract, unClaimedIds, addTransaction, account, isSupportedChainId])

  function getActionButton() {
    if (awaitingConfirmation) {
      return (
        <PrimaryButton active>
          Confirming <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }

    if (showTransactionPending) {
      return (
        <PrimaryButton active>
          Claiming <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }

    if (!totalRewards) {
      return <PrimaryButton disabled>Claim All</PrimaryButton>
    }

    return (
      <PrimaryButton onClick={onClaimAll}>
        Claim All <br /> ({formatAmount(totalRewards)} veDEUS)
      </PrimaryButton>
    )
  }

  return (
    <Container>
      <Hero>
        <div>veDEUS Rewards</div>
        <HeroSubtext>Happy claiming!</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <Box>DEUS Price: {formatDollarAmount(parseFloat(deusPrice), 2)}</Box>
          {getActionButton()}
        </UpperRow>
        <Table nftIds={nftIds} rewards={rewards} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
