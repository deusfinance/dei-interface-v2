import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'

import useOwnedNfts from 'hooks/useOwnedNfts'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Vest'
import { PrimaryButton } from 'components/Button'
import LockManager from 'components/App/Vest/LockManager'
import APYManager from 'components/App/Vest/APYManager'
import { RowEnd } from 'components/Row'
import Box from 'components/Box'
import { Info } from 'components/Icons'
import { ToolTip } from 'components/ToolTip'

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
      max-width: 200px;
      margin-right: auto;
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

const InfoIcon = styled(Info)`
  color: ${({ theme }) => theme.yellow2};
`
const CustomTooltip = styled(ToolTip)`
  max-width: 380px !important;
`

const AprWrapper = styled.a`
  align-items: center;
  text-decoration: none;
  justify-content: center;
  color: ${({ theme }) => theme.text2};
  display: flex;
  :hover {
    opacity: 0.7;
    text-decoration: underline;
    color: ${({ theme }) => theme.yellow2};
  }
  :focus {
    outline: none;
  }
`

export default function Vest() {
  const { chainId, account } = useWeb3React()
  const [showLockManager, setShowLockManager] = useState(false)
  const [showAPYManager, setShowAPYManager] = useState(false)
  const [nftId, setNftId] = useState(0)
  const nftIds = useOwnedNfts()
  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()

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

  return (
    <Container>
      <Hero>
        <div>veDEUS</div>
        <HeroSubtext>Happy dilution protection!</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <Link href="/vest/create" passHref>
            <PrimaryButton>Create Lock</PrimaryButton>
          </Link>
          <Box>DEUS Price: {formatDollarAmount(parseFloat(deusPrice), 2)}</Box>
          <Box>veDEUS Locked: {formatAmount(parseFloat(lockedVeDEUS), 0)}</Box>
          <Box data-for="id" data-tip={'veDEUS rewards are fully accruing in the Background'}>
            <CustomTooltip id="id" />
            <AprWrapper target={'target'} href={'https://lafayettetabor.medium.com/vedeus-dynamics-40a4a5489ae1'}>
              <p style={{ marginRight: '10px' }}>APR</p> <InfoIcon size={15} />
            </AprWrapper>
          </Box>
        </UpperRow>
        <Table nftIds={nftIds} toggleLockManager={toggleLockManager} toggleAPYManager={toggleAPYManager} />
      </Wrapper>
      <LockManager isOpen={showLockManager} onDismiss={() => setShowLockManager(false)} nftId={nftId} />
      <APYManager
        isOpen={showAPYManager}
        onDismiss={() => setShowAPYManager(false)}
        nftId={nftId}
        toggleLockManager={toggleLockManager}
      />
      <Disclaimer />
    </Container>
  )
}
