import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import Image from 'next/image'

import useOwnedNfts from 'hooks/useOwnedNfts'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import useWeb3React from 'hooks/useWeb3'
import { useVestedAPY } from 'hooks/useVested'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'
import veDEUS_LOGO from '/public/static/images/pages/veDEUS/veDEUS.svg'

import Hero from 'components/Hero'
import { useSearch, SearchField, Table } from 'components/App/Vest'
import { PrimaryButtonWide } from 'components/Button'
import LockManager from 'components/App/Vest/LockManager'
import APYManager from 'components/App/Vest/APYManager'
import { RowFixed, RowBetween } from 'components/Row'
import StatsHeader from 'components/StatsHeader'
import { Container, Title } from 'components/App/StableCoin'

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
    /* &:first-child {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        order: 2;
      `};
    }
    &:last-child {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        order: 1;
      `};
    } */
  }
`

export const ButtonText = styled.span<{ disabled?: boolean }>`
  /* font-family: 'Inter'; */
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;

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

export default function Vest() {
  const { chainId, account } = useWeb3React()
  const [showLockManager, setShowLockManager] = useState(false)
  const [showAPYManager, setShowAPYManager] = useState(false)
  const [nftId, setNftId] = useState(0)
  const nftIds = useOwnedNfts()
  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()

  // console.log(nftIds)

  // const { snapshot, searchProps } = useSearch()

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

  // TODO: move items to use memo
  const items = [
    { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusPrice), 2) },
    { name: 'Total veDEUS Locked', value: formatAmount(parseFloat(lockedVeDEUS), 0) },
  ]
  const ClaimableAmount = 0.063

  return (
    <Container>
      <Hero>
        <Image src={veDEUS_LOGO} height={'90px'} alt="Logo" />
        <Title>veDEUS</Title>
        <StatsHeader items={items} hasBox />
      </Hero>

      <Wrapper>
        <UpperRow>
          <div>
            <SearchField />
          </div>

          <ButtonWrapper>
            <PrimaryButtonWide>
              <ButtonText>Claim all ${ClaimableAmount} veDEUS</ButtonText>
            </PrimaryButtonWide>

            <TopBorderWrap>
              <TopBorder>
                <Link href="/vest/create" passHref>
                  <PrimaryButtonWide disabled>
                    <ButtonText disabled>Create Lock</ButtonText>
                  </PrimaryButtonWide>
                </Link>
              </TopBorder>
            </TopBorderWrap>
          </ButtonWrapper>
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
    </Container>
  )
}
