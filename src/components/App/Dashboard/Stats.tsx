import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import BG_DASHBOARD from '/public/static/images/pages/dashboard/bg.svg'

import { useDeiPrice } from 'hooks/useCoingeckoPrice'
import { useDeiStats } from 'hooks/useDeiStats'

import { formatAmount, formatBalance, formatDollarAmount } from 'utils/numbers'

import { Modal, ModalHeader } from 'components/Modal'
import { RowBetween } from 'components/Row'
import StatsItem from './StatsItem'
import Chart from './Chart'
import { CollateralPool, DEI_ADDRESS, escrow, USDCReserves3 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'
import { Loader } from 'components/Icons'
import useDeusMarketCapStats from 'hooks/useMarketCapStats'

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
  display: flex;
  flex-direction: column;
  gap: 36px;
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

const DeiTitleContainer = styled(RowBetween)`
  & > a {
    color: ${({ theme }) => theme.text2};
    margin-right: 20px;
    &:hover {
      color: ${({ theme }) => theme.text2};
      text-decoration: underline;
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
   & > a {
      margin-right: 0px;
    }
  `};
`

const Title = styled.span`
  font-family: 'Inter';
  font-size: 20px;
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

const ModalWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 1rem;
`};

  > div {
    margin: 4px 0px;
  }
`

const ModalInfoWrapper = styled(RowBetween)<{ active?: boolean }>`
  align-items: center;
  margin-top: 1px;
  white-space: nowrap;
  margin: auto;
  background-color: #0d0d0d;
  border: 1px solid #1c1c1c;
  border-radius: 15px;
  padding: 1.25rem 2rem;
  font-size: 0.75rem;
  min-width: 250px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      padding: 0.75rem 1rem;
      width: 90%;
      min-width: 265px;
    `}
  ${({ theme, active }) =>
    active &&
    `
    border: 1px solid ${theme.text1};
  `}
`

const ModalItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

export default function Stats() {
  const {
    totalSupply,
    collateralRatio,
    circulatingSupply,
    totalUSDCReserves,
    totalProtocolHoldings,
    usdcReserves3,
    usdcPoolReserves,
    escrowReserve,
    seigniorage,
  } = useDeiStats()

  const deiPrice = useDeiPrice()

  const {
    deusPrice,
    deusCirculatingSupply,
    deusTotalSupply,
    deusMarketCap,
    xDeusPrice,
    xDeusCirculatingSupply,
    xDeusMarketCap,
    combinedSupply,
    combinedMarketCap,
    combinedProjectedSupply,
    inflationRate,
  } = useDeusMarketCapStats()

  function getModalBody() {
    return (
      <ModalWrapper>
        <div>DEI Total Reserve Assets are held in three wallets.</div>
        <div>Below is the USDC holdings in each wallet.</div>
        <ModalInfoWrapper>
          <a
            href={
              ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + USDCReserves3[SupportedChainId.FANTOM]
            }
            target={'_blank'}
            rel={'noreferrer'}
          >
            Reserves 1
          </a>
          {usdcReserves3 === null ? <Loader /> : <ModalItemValue>{formatAmount(usdcReserves3, 2)}</ModalItemValue>}
        </ModalInfoWrapper>
        <ModalInfoWrapper>
          <a
            href={ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + escrow[SupportedChainId.FANTOM]}
            target={'_blank'}
            rel={'noreferrer'}
          >
            Reserves 2
          </a>
          {escrowReserve === null ? <Loader /> : <ModalItemValue>{formatAmount(escrowReserve, 2)}</ModalItemValue>}
        </ModalInfoWrapper>
        <ModalInfoWrapper>
          <a
            href={
              ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl +
              '/address/' +
              CollateralPool[SupportedChainId.FANTOM]
            }
            target={'_blank'}
            rel={'noreferrer'}
          >
            Collateral Pool
          </a>
          {usdcPoolReserves === null ? (
            <Loader />
          ) : (
            <ModalItemValue>{formatAmount(usdcPoolReserves, 2)}</ModalItemValue>
          )}
        </ModalInfoWrapper>
        <ModalInfoWrapper active>
          <p>Total USDC holdings</p>
          {totalProtocolHoldings === null ? (
            <Loader />
          ) : (
            <ModalItemValue>{formatAmount(usdcPoolReserves + usdcReserves3 + escrowReserve, 2)}</ModalItemValue>
          )}
        </ModalInfoWrapper>
      </ModalWrapper>
    )
  }

  const [toggleDashboardModal, setToggleDashboardModal] = useState(false)

  function getModalContent() {
    return (
      <>
        <ModalHeader title={'Total Reserve Assets'} onClose={() => setToggleDashboardModal(false)} />
        {getModalBody()}
      </>
    )
  }

  const usdcBackingPerDei = useMemo(() => {
    if (collateralRatio > 100) return '100%'
    else if (collateralRatio < 90) return '90%'
    return `${formatAmount(collateralRatio, 1).toString()}%`
  }, [collateralRatio])

  return (
    <>
      <Wrapper>
        <AllStats>
          <StatsWrapper>
            <DeiTitleContainer>
              <Title>DEI Stats</Title>
            </DeiTitleContainer>
            <Info>
              <StatsItem
                name="DEI Price"
                value={formatDollarAmount(parseFloat(deiPrice), 3)}
                href="https://www.coingecko.com/en/coins/dei-token"
              />
              <StatsItem
                name="Total Supply"
                value={formatAmount(totalSupply, 2)}
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
                }
              />
              <StatsItem
                name="Seigniorage"
                value={`${formatBalance(seigniorage, 2)}%`}
                href={'https://docs.deus.finance/usddei/dei-stablecoin-overview'}
              />
              <StatsItem
                name="Circulating Supply"
                value={formatAmount(circulatingSupply, 2)}
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/token/' + DEI_ADDRESS[SupportedChainId.FANTOM]
                }
              />
              <StatsItem
                name="Total Reserve Assets"
                value={formatDollarAmount(totalUSDCReserves, 2)}
                onClick={() => setToggleDashboardModal(true)}
              />
              <StatsItem name="USDC Backing Per DEI" value={usdcBackingPerDei} />
            </Info>
          </StatsWrapper>
          <StatsWrapper>
            <DeusTitle>DEUS Stats</DeusTitle>
            <Info>
              <StatsItem
                name="DEUS Price"
                value={formatDollarAmount(deusPrice, 2)}
                href={'https://www.coingecko.com/en/coins/deus-finance'}
              />
              <StatsItem name="Circulating Supply" value={formatAmount(deusCirculatingSupply)} />
              <StatsItem name="Total Supply" value={formatAmount(deusTotalSupply)} />
              <StatsItem name="Market Cap" value={formatAmount(deusMarketCap)} />
            </Info>
          </StatsWrapper>
          <StatsWrapper>
            <DeusTitle>xDEUS Stats</DeusTitle>
            <Info>
              <StatsItem name="xDEUS Price" value={formatDollarAmount(xDeusPrice)} />
              <StatsItem name="Circulating Supply" value={formatAmount(xDeusCirculatingSupply)} />
              <StatsItem name="Market Cap" value={formatDollarAmount(xDeusMarketCap)} />
            </Info>
          </StatsWrapper>
          <StatsWrapper>
            <DeusTitle>xDEUS and DEUS Combined Stats</DeusTitle>
            <Info>
              <StatsItem name="Combined Supply" value={formatAmount(combinedSupply, 2, undefined, true)} />
              <StatsItem name="Combined Market Cap" value={formatAmount(combinedMarketCap)} />
              <StatsItem
                name="Projected Combined Supply in 1yr"
                value={formatAmount(combinedProjectedSupply, 2, undefined, true)}
              />
              <StatsItem name="Inflation Rate" value={formatAmount(inflationRate) + '%'} />
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
      <Modal
        width="500px"
        isOpen={toggleDashboardModal}
        onBackgroundClick={() => setToggleDashboardModal(false)}
        onEscapeKeydown={() => setToggleDashboardModal(false)}
      >
        {getModalContent()}
      </Modal>
    </>
  )
}
