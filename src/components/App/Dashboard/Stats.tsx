import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import BG_DASHBOARD from '/public/static/images/pages/dashboard/bg.svg'

import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useDeiStats } from 'hooks/useDeiStats'
import { useVestedAPY } from 'hooks/useVested'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'

import { RowBetween } from 'components/Row'
import StatsItem from './StatsItem'
import Chart from './Chart'
import { DEI_ADDRESS, veDEUS } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'

const Wrapper = styled(RowBetween)`
  background: ${({ theme }) => theme.bg0};
  align-items: stretch;
  border-radius: 12px;
  padding: 38px 36px;
  padding-left: 14px;
  margin-bottom: 80px;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;
  `};
`

const ChartWrapper = styled.div`
  /* border: 1px solid ${({ theme }) => theme.border1}; */
  /* background-color: ${({ theme }) => theme.bg0}; */
  border-radius: 12px;
  width: 100%;
  min-width: 200px;
  min-height: 200px;
  margin-left: 15px;
  z-index: 1;
`

const AllStats = styled.div`
  width: 100%;
  & > * {
    &:nth-child(2) {
      margin-top: 36px;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom:25px;
  `};
`

const StatsWrapper = styled.div`
  display: block;
`

const Info = styled(RowBetween)`
  width: 100%;

  gap: 16px 0;
  flex-wrap: wrap;
  & > * {
    margin-top: 16px;
    &:nth-child(3n) {
      border-right: none;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin:unset;
      & > * {
      &:nth-child(3n) {
        border-right: 1px solid ${({ theme }) => theme.border1};
      }
      &:nth-child(2n) {
        border-right: none;
      }
    }
  `};
`

const Title = styled.span`
  font-family: 'Inter';
  font-size: 20px;
  margin-left: 22px;
  background: ${({ theme }) => theme.specialBG1};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left:11px;
  `};
`

export const DeusTitle = styled(Title)`
  background: ${({ theme }) => theme.deusColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const BackgroundImageWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 50%;
  height: 100%;
  right: 10px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display:none;
  `};
`

export default function Stats() {
  const deusPrice = useDeusPrice()
  const { totalSupply, totalProtocolHoldings, collateralRatio, circulatingSupply, totalUSDCReserves } = useDeiStats()

  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())

  return (
    <Wrapper>
      <AllStats>
        <StatsWrapper>
          <Title>DEI Stats</Title>
          <Info>
            <StatsItem name="DEI Price" value={'$1.00'} href="https://www.coingecko.com/en/coins/dei-token" />
            <StatsItem
              name="Total Supply"
              value={formatAmount(totalSupply, 2)}
              href={
                ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
              }
            />
            <StatsItem
              name="Total Protocol Holdings"
              value={formatAmount(totalProtocolHoldings, 2)}
              href={
                ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl +
                '/token/' +
                DEI_ADDRESS[SupportedChainId.FANTOM] +
                '#balances'
              }
            />
            <StatsItem
              name="Circulating Supply"
              value={formatAmount(circulatingSupply, 2)}
              href={
                ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
              }
            />
            <StatsItem name="Total Reserve Assets" value={formatDollarAmount(totalUSDCReserves, 2)} />
            <StatsItem name="USDC Backing Per DEI" value={formatAmount(collateralRatio, 1).toString() + '%'} />
          </Info>
        </StatsWrapper>
        <StatsWrapper>
          <DeusTitle>DEUS Stats</DeusTitle>
          <Info>
            <StatsItem
              name="DEUS Price"
              value={formatDollarAmount(parseFloat(deusPrice), 2)}
              href={'https://www.coingecko.com/en/coins/deus-finance'}
            />
            <StatsItem name="Total Supply" value="N/A" />
            <StatsItem name="Market Cap" value="N/A" />
            <StatsItem
              name="veDEUS Supply"
              value={formatAmount(parseFloat(lockedVeDEUS), 0)}
              href={ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + veDEUS[SupportedChainId.FANTOM]}
            />
          </Info>
        </StatsWrapper>
      </AllStats>
      <ChartWrapper>
        <Chart />
      </ChartWrapper>
      <BackgroundImageWrapper>
        <Image src={BG_DASHBOARD} alt="swap bg" layout="fill" objectFit="cover" />
      </BackgroundImageWrapper>
    </Wrapper>
  )
}
