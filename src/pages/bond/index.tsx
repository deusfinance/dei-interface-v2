import React, { useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'

import DEI_LOGO from '/public/static/images/pages/bond/DEI_logo.svg'

import useWeb3React from 'hooks/useWeb3'
import { useOwnerBondNFTs } from 'hooks/useOwnerNfts'
import { BondNFT, useUserClaimableDEI, useUserDeiBondInfo } from 'hooks/useBondsPage'

import Hero from 'components/Hero'
import { RowBetween } from 'components/Row'
import StatsHeader from 'components/StatsHeader'
import { Container } from 'components/App/StableCoin'
import RemainingDEI from 'components/App/Bond/RemainingDEI'
import { useSearch, SearchField, Table } from 'components/App/Bond'
import { ExternalLink } from 'components/Link'
import ExternalLinkIcon from '/public/static/images/pages/common/down.svg'

const Wrapper = styled(Container)<{
  mt?: string
}>`
  margin: 0 auto;
  margin-top: ${({ mt }) => mt || '50px'};
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

const FirstRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
  & > div {
    width: auto;
  }
  a {
    margin-right: 10px;
    color: ${({ theme }) => theme.text2};
    &:hover {
      text-decoration: underline;
      color: ${({ theme }) => theme.text2};
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    a {
    font-size:12px;
    &>span{
      width:6px !important;
height:6px !important;
    }
  }
  `}
`

const UpperRowMobile = styled(UpperRow)<{ hasSecondRow?: boolean }>`
  /* margin-bottom: ${({ hasSecondRow }) => (hasSecondRow ? '0' : '-20px')}; */
`

export default function Bond() {
  const { account } = useWeb3React()
  const ownedNfts = useOwnerBondNFTs()
  const { snapshot, searchProps } = useSearch()
  const result = snapshot.options.map((nft) => nft)
  const snapshotList = useMemo(() => {
    return result.map((obj: any) => {
      return { tokenId: obj?.tokenId, redeemTime: obj?.redeemTime, deiAmount: obj?.deiAmount }
    })
  }, [result])

  function getUpperRow() {
    return (
      <UpperRow>
        <FirstRowWrapper>
          <SearchField searchProps={searchProps} />
          <ExternalLink href="https://docs.deus.finance/usddei/usddei-bonds">
            Read more <Image alt="external-link" src={ExternalLinkIcon} width={8} height={8} />
          </ExternalLink>
        </FirstRowWrapper>
      </UpperRow>
    )
  }

  function getUpperRowMobile() {
    return (
      <UpperRowMobile hasSecondRow={!!snapshotList.length}>
        <FirstRowWrapper>
          <SearchField searchProps={searchProps} />
          <ExternalLink href="https://docs.deus.finance/usddei/usddei-bonds">
            Read more <Image alt="external-link" src={ExternalLinkIcon} width={8} height={8} />
          </ExternalLink>
        </FirstRowWrapper>
      </UpperRowMobile>
    )
  }

  const userStats = useUserDeiBondInfo()

  const items = useMemo(() => [{ name: 'Total DEI Claimed', value: '0' }, ...userStats], [userStats])
  const { claimedDEI } = useUserClaimableDEI()

  return (
    <Container>
      <Hero>
        <Image src={DEI_LOGO} width={'76px'} height={'90px'} alt="Logo" />
        <StatsHeader items={items} />
      </Hero>
      {account && claimedDEI.gt(0) && <RemainingDEI remainingDEI={claimedDEI} isMobile={isMobile} />}
      <Wrapper>
        {isMobile ? getUpperRowMobile() : getUpperRow()}
        <Table nfts={snapshotList as BondNFT[]} isMobile={isMobile} isLoading={ownedNfts.isLoading} />
      </Wrapper>
    </Container>
  )
}
