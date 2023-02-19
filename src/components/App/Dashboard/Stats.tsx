import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import BG_DASHBOARD from '/public/static/images/pages/dashboard/bg.svg'

import { useDeiPrice } from 'state/dashboard/hooks'
import { useDeiStats } from 'hooks/useDeiStats'

import { formatAmount, formatBalance, formatDollarAmount } from 'utils/numbers'

import { Modal, ModalHeader } from 'components/Modal'
import { RowBetween } from 'components/Row'
import StatsItem from './StatsItem'
import Chart from './Chart'
import { CollateralPool, DEI_ADDRESS, escrow, USDCReserves3 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ChainInfo } from 'constants/chainInfo'
import { Loader, Info as InfoImage, Link } from 'components/Icons'
import { ExternalLink } from 'components/Link'
import ExternalLinkIcon from '/public/static/images/pages/common/down.svg'
import useDeusMarketCapStats from 'hooks/useMarketCapStats'
import { ToolTip } from 'components/ToolTip'

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
  justify-content: start;
  & > * {
    margin-top: 16px;
    &:nth-child(3n) {
      border-right: none;
    }
    &:last-child {
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

const ModalText = styled.div`
  color: ${({ theme }) => theme.yellow3};
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

const CustomTooltip = styled(ToolTip)`
  max-width: 600px !important;
  font-size: 0.8rem !important;
`

const InfoIcon = styled(InfoImage)`
  margin-left: 4px;
  color: ${({ theme }) => theme.text1} !important;
`

const ExtLink = styled(ExternalLink)`
  display: flex;
`

enum DASHBOARD_STATS_TITLES {
  DEI_TOTAL_RESERVES = 'Total Reserve Assets',
  DEUS_CIRCULATING_SUPPLY = 'Deus Circulating Supply',
  DEUS_TOTAL_SUPPLY = 'Deus Total Supply',
  XDEUS_CIRCULATING_SUPPLY = 'xDEUS Circulating Supply',
}

export default function Stats() {
  //const deusPrice = useDeusPrice()
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
    deusNonCirculatingSupply,
    deusSupplyInBridges,
    deusSupplyInVeDeusContract,
    deusTotalSupplyOnChain,
    xDeusPrice,
    xDeusCirculatingSupply,
    xDeusNonCirculatingSupply,
    xDeusTotalSupply,
    xDeusMarketCap,
    combinedSupply,
    combinedMarketCap,
    combinedProjectedSupply,
    inflationRate,
    emissionPerWeek,
  } = useDeusMarketCapStats()

  const [modalId, setModalId] = useState(DASHBOARD_STATS_TITLES.DEI_TOTAL_RESERVES)
  const [toggleDashboardModal, setToggleDashboardModal] = useState(false)
  //const [toggleInfoModal, setToggleInfoModal] = useState(false)

  function getModalHeader() {
    return <ModalHeader title={modalId} onClose={() => setToggleDashboardModal(false)} />
  }

  function getModalBody() {
    switch (modalId) {
      case DASHBOARD_STATS_TITLES.DEI_TOTAL_RESERVES:
        return (
          <ModalWrapper>
            <div>DEI Total Reserve Assets are held in three wallets.</div>
            <div>Below is the USDC holdings in each wallet.</div>
            <ModalInfoWrapper>
              <a
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl +
                  '/address/' +
                  USDCReserves3[SupportedChainId.FANTOM]
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
                href={
                  ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + escrow[SupportedChainId.FANTOM]
                }
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
      case DASHBOARD_STATS_TITLES.DEUS_CIRCULATING_SUPPLY:
        return (
          <ModalWrapper>
            <div>DEUS Circulating Supply is calculated as:</div>
            <ModalText>Circulating Supply = Total Supply - Non Circulating Supply</ModalText>
            <ModalInfoWrapper>
              <p onClick={() => handleDashboardModal(DASHBOARD_STATS_TITLES.DEUS_TOTAL_SUPPLY)}>
                Total Supply
                <Link style={{ marginTop: '6px', marginLeft: '6px' }} />
              </p>
              {deusTotalSupply === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(deusTotalSupply, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <p
                style={{ display: 'flex' }}
                data-for="id"
                data-tip="Balance held in <br/>Rewarders, Gnosis wallets etc"
              >
                Non Circulating Supply
                <span style={{ marginTop: '2px' }}>
                  <InfoIcon size={12} />
                  <CustomTooltip id="id" />
                </span>
              </p>
              {deusNonCirculatingSupply === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(deusNonCirculatingSupply, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Circulating Supply</p>
              {deusCirculatingSupply === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(deusCirculatingSupply, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case DASHBOARD_STATS_TITLES.DEUS_TOTAL_SUPPLY:
        return (
          <ModalWrapper>
            <div>DEUS Total Supply is calculated as:</div>
            <ModalText>
              Total Supply = Total Supply across all chains - Balance held in Bridge contracts - Balance held in
              deprecated veDeus contract
            </ModalText>
            <ModalInfoWrapper>
              <p>Total Supply across all chains</p>
              {deusTotalSupplyOnChain === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(deusTotalSupplyOnChain, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <p>Balance held in Bridge contracts</p>
              {deusSupplyInBridges === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(deusSupplyInBridges, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <ExtLink href="https://ftmscan.com/token/0xde5ed76e7c05ec5e4572cfc88d1acea165109e44?a=0x8b42c6cb07c8dd5fe5db3ac03693867afd11353d">
                <p>Balance in deprecated veDeus contract</p>
                <Link style={{ marginTop: '6px', marginLeft: '6px' }} />
              </ExtLink>
              {deusSupplyInVeDeusContract === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(deusSupplyInVeDeusContract, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Total Supply</p>
              {deusTotalSupply === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(deusTotalSupply, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      case DASHBOARD_STATS_TITLES.XDEUS_CIRCULATING_SUPPLY:
        return (
          <ModalWrapper>
            <div>xDEUS Circulating Supply is calculated as:</div>
            <ModalText>Circulating Supply = Total Supply - Non Circulating Supply</ModalText>
            <ModalInfoWrapper>
              <p>Total Supply</p>
              {xDeusTotalSupply === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(xDeusTotalSupply, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper>
              <p
                style={{ display: 'flex' }}
                data-for="id"
                data-tip="Balance held in <br/>MultiSig, Rewarder wallets etc"
              >
                Non Circulating Supply
                <span style={{ marginTop: '2px' }}>
                  <InfoIcon size={12} />
                  <CustomTooltip id="id" />
                </span>
              </p>
              {xDeusNonCirculatingSupply === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(xDeusNonCirculatingSupply, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
            <ModalInfoWrapper active>
              <p>Circulating Supply</p>
              {xDeusCirculatingSupply === null ? (
                <Loader />
              ) : (
                <ModalItemValue>{formatAmount(xDeusCirculatingSupply, 2, undefined, true)}</ModalItemValue>
              )}
            </ModalInfoWrapper>
          </ModalWrapper>
        )
      default:
        return null
    }
  }

  function getModalContent() {
    return (
      <>
        {getModalHeader()}
        {getModalBody()}
      </>
    )
  }

  function handleDashboardModal(id: DASHBOARD_STATS_TITLES) {
    setModalId(id)
    setToggleDashboardModal(true)
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
                onClick={() => handleDashboardModal(DASHBOARD_STATS_TITLES.DEI_TOTAL_RESERVES)}
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
              <StatsItem
                name="Circulating Supply"
                value={formatAmount(deusCirculatingSupply)}
                onClick={() => handleDashboardModal(DASHBOARD_STATS_TITLES.DEUS_CIRCULATING_SUPPLY)}
              />
              <StatsItem
                name="Total Supply"
                value={formatAmount(deusTotalSupply)}
                onClick={() => handleDashboardModal(DASHBOARD_STATS_TITLES.DEUS_TOTAL_SUPPLY)}
              />
              <StatsItem
                name="Market Cap"
                value={formatAmount(deusMarketCap)}
                hasToolTip={true}
                toolTipInfo={'Market Cap = Circulating Supply * Price'}
              />
            </Info>
          </StatsWrapper>
          <StatsWrapper>
            <DeusTitle>xDEUS Stats</DeusTitle>
            <Info>
              <StatsItem name="xDEUS Price" value={formatDollarAmount(xDeusPrice)} />
              <StatsItem
                name="Circulating Supply"
                value={formatAmount(xDeusCirculatingSupply)}
                onClick={() => handleDashboardModal(DASHBOARD_STATS_TITLES.XDEUS_CIRCULATING_SUPPLY)}
              />
              <StatsItem
                name="Market Cap"
                value={formatDollarAmount(xDeusMarketCap)}
                hasToolTip={true}
                toolTipInfo={'Market Cap = Circulating Supply * Price'}
              />
            </Info>
          </StatsWrapper>
          <StatsWrapper>
            <DeusTitle>xDEUS and DEUS Combined Stats</DeusTitle>
            <Info>
              <StatsItem
                name="Combined Supply"
                value={formatAmount(combinedSupply, 2, undefined, true)}
                hasToolTip={true}
                toolTipInfo={'Combined Supply = DEUS Circulating Supply + xDEUS Circulating Supply'}
              />
              <StatsItem
                name="Combined Market Cap"
                value={formatAmount(combinedMarketCap)}
                hasToolTip={true}
                toolTipInfo={'Combined Market Cap = DEUS Market Cap + xDEUS Market Cap'}
              />
              <StatsItem
                name="Projected Combined Supply in 1yr"
                value={formatAmount(combinedProjectedSupply, 2, undefined, true)}
                hasToolTip={true}
                toolTipInfo={'Projected Supply = Combined Supply * (1 + Inflation Rate)'}
              />
              <StatsItem name="Inflation Rate" value={formatAmount(inflationRate) + '%'} />
              <StatsItem name="Combined emissions per week" value={formatAmount(emissionPerWeek)} />
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
      {/* <Modal
        width="400px"
        isOpen={toggleInfoModal}
        onBackgroundClick={() => setToggleInfoModal(false)}
        onEscapeKeydown={() => setToggleInfoModal(false)}
      >
        {getModalContent()}
      </Modal> */}
    </>
  )
}
