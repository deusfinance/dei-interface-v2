import React, { useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import BG_DASHBOARD from '/public/static/images/pages/dashboard/bg.svg'

import { useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useDeiStats } from 'hooks/useDeiStats'
import { useVestedAPY } from 'hooks/useVested'

import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { getMaximumDate } from 'utils/vest'

import { Modal, ModalHeader } from 'components/Modal'
import { RowBetween } from 'components/Row'
import StatsItem from './StatsItem'
import Chart from './Chart'
import { AMO, CollateralPool, DEI_ADDRESS, MSIG, USDCReserves1, USDCReserves2, veDEUS } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'
import { Loader } from 'components/Icons'

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

const ModalInfoWrapper = styled(RowBetween)<{
  active?: boolean
}>`
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

export enum Dashboard {
  EMPTY = 'EMPTY',
  TOTAL_RESERVE_ASSETS = 'Total Reserve Assets',
  TOTAL_PROTOCOL_HOLDINGS = 'Total Protocol Holdings',
}

export default function Stats() {
  const deusPrice = useDeusPrice()
  const {
    totalSupply,
    collateralRatio,
    circulatingSupply,
    totalUSDCReserves,
    totalProtocolHoldings,
    AMOReserve,
    MSIGReserve,
    usdcReserves1,
    usdcReserves2,
    usdcPoolReserves,
  } = useDeiStats()

  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deiPrice = useDeiPrice()

  const [stat, setStat] = useState(Dashboard.EMPTY)

  function getModalBody() {
    switch (stat) {
      case Dashboard.EMPTY:
        return null
      case Dashboard.TOTAL_RESERVE_ASSETS:
        return (
          <ModalWrapper>
            <div>DEI Total Reserve Assets are held in three wallets.</div>
            <div>Below is the USDC holdings in each wallet.</div>
            <ModalInfoWrapper>
              <a
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl +
                  '/address/' +
                  USDCReserves1[SupportedChainId.FANTOM]
                }
                target={'_blank'}
                rel={'noreferrer'}
              >
                Reserves 1
              </a>
              {usdcReserves1 === null ? <Loader /> : <ModalItemValue>{formatAmount(usdcReserves1, 2)}</ModalItemValue>}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <a
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl +
                  '/address/' +
                  USDCReserves2[SupportedChainId.FANTOM]
                }
                target={'_blank'}
                rel={'noreferrer'}
              >
                Reserves 2
              </a>
              {usdcReserves2 === null ? <Loader /> : <ModalItemValue>{formatAmount(usdcReserves2, 2)}</ModalItemValue>}
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
                <ModalItemValue>{formatAmount(usdcReserves1 + usdcReserves2 + usdcPoolReserves, 2)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case Dashboard.TOTAL_PROTOCOL_HOLDINGS:
        return (
          <ModalWrapper>
            <ModalInfoWrapper>
              <a
                href={ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + AMO[SupportedChainId.FANTOM]}
                target={'_blank'}
                rel={'noreferrer'}
              >
                AMO
              </a>
              {AMOReserve === null ? <Loader /> : <ModalItemValue>{formatAmount(AMOReserve, 2)}</ModalItemValue>}
            </ModalInfoWrapper>

            <ModalInfoWrapper>
              <a
                href={ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + MSIG[SupportedChainId.FANTOM]}
                target={'_blank'}
                rel={'noreferrer'}
              >
                DEUS Owned Gnosis
              </a>
              {MSIGReserve === null ? <Loader /> : <ModalItemValue>{formatAmount(MSIGReserve, 2)}</ModalItemValue>}
            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Total Protocol holdings</p>
              {totalProtocolHoldings === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(MSIGReserve + AMOReserve, 2)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
    }
  }

  const [toggleDashboardModal, setToggleDashboardModal] = useState(false)

  function handleClick(flag: Dashboard) {
    setStat(flag)
    setToggleDashboardModal(!toggleDashboardModal)
  }

  function getModalContent() {
    return (
      <>
        <ModalHeader title={stat} onClose={() => setToggleDashboardModal(false)} />
        {getModalBody()}
      </>
    )
  }

  return (
    <>
      <Wrapper>
        <AllStats>
          <StatsWrapper>
            <Title>DEI Stats</Title>
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
                name="Total Protocol Holdings"
                value={formatAmount(AMOReserve + MSIGReserve, 2)}
                onClick={() => handleClick(Dashboard.TOTAL_PROTOCOL_HOLDINGS)}
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
                onClick={() => handleClick(Dashboard.TOTAL_RESERVE_ASSETS)}
              />
              <StatsItem name="USDC Backing Per DEI" value={formatAmount(collateralRatio, 3).toString()} />
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
              <StatsItem
                name="Total Supply"
                value="650k"
                href={'https://lafayettetabor.medium.com/a-wealth-creating-revamped-redeem-plan-601dadcc29a1'}
              />
              <StatsItem name="Market Cap" value="N/A" />
              <StatsItem
                name="veDEUS Supply"
                value={formatAmount(parseFloat(lockedVeDEUS), 0)}
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + veDEUS[SupportedChainId.FANTOM]
                }
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
