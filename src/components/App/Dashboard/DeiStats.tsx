import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useRedeemData } from 'hooks/useRedemptionPage'

import { RowBetween } from 'components/Row'
import { Loader } from 'components/Icons'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useBonderData, useGetRedeemTime } from 'hooks/useBondsPage'
import { useGlobalDEIBorrowed } from 'hooks/usePoolData'
import { useBorrowPools } from 'state/borrow/hooks'
import { getRemainingTime } from 'utils/time'
import useDebounce from 'hooks/useDebounce'
import { useDeiPrice } from 'hooks/useCoingeckoPrice'
import { useTokenPerBlock } from 'hooks/useBdeiStakingPage'
import { useDeiStats } from 'hooks/useDeiStats'
import { StakingPools } from 'constants/stakings'
import { useGetApy } from 'hooks/useStakingInfo'
import { useDashboardModalToggle } from 'state/application/hooks'
import StatsModal from './StatsModal'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  margin-top: 50px;
`

const TopWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  max-width: 1200px;
  gap: 2rem;
  justify-content: start;
  margin: 0 auto;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column nowrap;
  `}
`

const StatsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 2rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 0 auto;
  `}
`

const InfoWrapper = styled(RowBetween)<{
  secondary?: boolean
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
  min-width: 500px;
  width: 100%;

  &:hover {
    background: #141414;
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.75rem 1rem;
    width: 90%;
    min-width: 250px;
  `}

  ${({ secondary }) =>
    secondary &&
    `
    min-width: 250px;
  `}
`

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-self: start;
  background-color: #2f2f2f;
  border: 1px solid #0d0d0d;
  border-radius: 15px;
  padding: 1.25rem 1rem;
  font-size: 1rem;
  min-width: 500px;
  width: 100%;
  gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
    padding: 0.75rem 0.5rem;
    margin: 0 auto;
    min-width: 265px;
    gap: 0.5rem;
  `}
`

const ItemValue = styled.div`
  display: flex;
  align-self: end;
  color: ${({ theme }) => theme.yellow3};
  margin-left: 5px;

  > span {
    margin-left: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

const Heading = styled.div`
  display: flex;
  align-self: center;
  margin-left: 1rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:90%;
  `}
`

const ItemWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 0.25rem;
`

const SubWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    gap: 0.5rem;
    flex-flow: column nowrap;
  `}
`

export enum Dashboard {
  EMPTY = 'EMPTY',
  DEI_PRICE = 'DEI Price',
  DEI_TOTAL_SUPPLY = 'DEI Total Supply',
  DEI_PROTOCOL_HOLDINGS = 'DEI Protocol Holdings',
  TOTAL_DEI_BONDED = 'Total DEI Bonded',
  DEI_CIRCULATING_SUPPLY = 'DEI Circulating Supply',
  TOTAL_USDC_RESERVES = 'Total USDC Reserves',
  USDC_BACKING_FOR_DEI = 'USDC Backing per DEI',
  GLOBAL_DEI_BORROWED = 'Global DEI Borrowed',
  TOTAL_DEI_REDEEMED = 'Total DEI Redeemed',
  REDEMPTION_PER_DEI = 'Redemption per DEI',
  TOTAL_BDEI_STAKED = 'Total bDEI Staked',
  BDEI_STAKING_APR = 'bDEI Staking APR',
  BDEI_LIQUIDITY = 'bDEI Liquidity in bDEI-DEI Pool',
  DEI_LIQUIDITY = 'DEI Liquidity in bDEI-DEI Pool',
  BDEI_DEI_LIQUIDITY = 'Total Liquidity in bDEI-DEI Pool',
  BDEI_DEI_STAKING_APR = 'bDEI-DEI Staking APR',
  DEI_BOND_MATURITY = 'Current DEI Bond Maturity',
  DEUS_PRICE = 'DEUS Price',
  VE_DEUS_LOCKED = 'veDEUS Locked',
  VDEUS_NFTS = 'vDEUS NFTs',
  TOTAL_VDEUS_STAKED = 'Total vDEUS Staked',
  VDEUS_STAKED_3MONTHS = 'Total vDEUS Staked for 3 Months',
  VDEUS_STAKED_6MONTHS = 'Total vDEUS Staked for 6 Months',
  VDEUS_STAKED_12MONTHS = 'Total vDEUS Staked for 12 Months',
}

export default function DeiStats() {
  const toggleDashboardModal = useDashboardModalToggle()

  const [currentStat, setCurrentStat] = useState(Dashboard.EMPTY)

  const deiPrice = useDeiPrice()
  const { redeemTranche, deiBurned } = useRedeemData()

  const { deiBonded } = useBonderData()
  const { totalDeposited } = useTokenPerBlock()

  const pools = useBorrowPools()
  const { borrowedElastic } = useGlobalDEIBorrowed(pools)

  const debouncedAmountIn = useDebounce('', 500)
  const { redeemTime } = useGetRedeemTime(debouncedAmountIn || '0')
  const { day, hours } = getRemainingTime(redeemTime)
  const roundedDays = day + (hours > 12 ? 1 : 0) //adds 1 more day if remained hours is above 12 hours.

  const { pid: deiPID } = StakingPools[0] //bDEI single staking pool
  const bDeiSingleStakingAPR = useGetApy(deiPID)

  const { pid: deibDeiPID } = StakingPools[1] //bDEI-DEI staking pool
  const bDeiDeiStakingAPR = useGetApy(deibDeiPID)

  const {
    totalSupply,
    totalProtocolHoldings,
    circulatingSupply,
    totalUSDCReserves,
    sPoolDEILiquidity,
    sPoolbDEILiquidity,
    sPoolLiquidity,
  } = useDeiStats()

  const usdcBackingPerDei = useMemo(() => {
    return totalUSDCReserves / circulatingSupply
  }, [totalUSDCReserves, circulatingSupply])

  const showLoader = redeemTranche.trancheId == null ? true : false

  function handleClick(flag: Dashboard) {
    setCurrentStat(flag)
    toggleDashboardModal()
  }

  return (
    <>
      <Wrapper>
        <TopWrapper>
          <Container>
            <Heading>DEI stats</Heading>
            <div onClick={() => handleClick(Dashboard.DEI_PRICE)}>
              <InfoWrapper>
                <p>Price</p>
                {deiPrice === null ? <Loader /> : <ItemValue>{formatDollarAmount(parseFloat(deiPrice), 2)}</ItemValue>}
              </InfoWrapper>
            </div>
            <Container>
              <div onClick={() => handleClick(Dashboard.DEI_TOTAL_SUPPLY)}>
                <InfoWrapper>
                  <p>Total Supply</p>
                  {totalSupply === null ? <Loader /> : <ItemValue>{formatAmount(totalSupply, 2)}</ItemValue>}
                </InfoWrapper>
              </div>
              <SubWrapper>
                <div onClick={() => handleClick(Dashboard.DEI_PROTOCOL_HOLDINGS)}>
                  <InfoWrapper secondary={true}>
                    <p>Protocol Holdings</p>
                    {totalProtocolHoldings === null ? (
                      <Loader />
                    ) : (
                      <ItemValue>{formatAmount(totalProtocolHoldings, 2)}</ItemValue>
                    )}
                  </InfoWrapper>
                </div>
                <div onClick={() => handleClick(Dashboard.TOTAL_DEI_BONDED)}>
                  <InfoWrapper secondary={true}>
                    <p>Total DEI Bonded</p>
                    {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
                  </InfoWrapper>
                </div>
              </SubWrapper>
              <div onClick={() => handleClick(Dashboard.DEI_CIRCULATING_SUPPLY)}>
                <InfoWrapper>
                  <p>Circulating Supply</p>
                  {circulatingSupply === null ? (
                    <Loader />
                  ) : (
                    <ItemValue>{formatAmount(circulatingSupply, 2)}</ItemValue>
                  )}
                </InfoWrapper>
              </div>
            </Container>
            <div onClick={() => handleClick(Dashboard.TOTAL_USDC_RESERVES)}>
              <InfoWrapper>
                <p>Total USDC Reserves</p>
                {totalUSDCReserves === null ? <Loader /> : <ItemValue>{formatAmount(totalUSDCReserves, 2)}</ItemValue>}
              </InfoWrapper>
            </div>
            <div onClick={() => handleClick(Dashboard.USDC_BACKING_FOR_DEI)}>
              <InfoWrapper>
                <p>USDC Backing per DEI</p>
                {usdcBackingPerDei === null ? (
                  <Loader />
                ) : (
                  <ItemValue>{formatDollarAmount(usdcBackingPerDei, 2)}</ItemValue>
                )}
              </InfoWrapper>
            </div>
            <div onClick={() => handleClick(Dashboard.GLOBAL_DEI_BORROWED)}>
              <InfoWrapper>
                <p>Global DEI Borrowed</p>
                {borrowedElastic === null ? (
                  <Loader />
                ) : (
                  <ItemValue>{formatAmount(parseFloat(borrowedElastic))}</ItemValue>
                )}
              </InfoWrapper>
            </div>
          </Container>
          <StatsWrapper>
            <Container>
              <Heading>Redemption stats</Heading>
              <div onClick={() => handleClick(Dashboard.TOTAL_DEI_REDEEMED)}>
                <InfoWrapper>
                  <p>Total DEI Redeemed</p>
                  {showLoader ? <Loader /> : <ItemValue>{formatAmount(deiBurned)}</ItemValue>}
                </InfoWrapper>
              </div>
              <div onClick={() => handleClick(Dashboard.REDEMPTION_PER_DEI)}>
                <InfoWrapper>
                  <p>Redemption per DEI</p>
                  <ItemWrapper>
                    <ItemValue>
                      ${showLoader ? <Loader /> : redeemTranche.USDRatio}
                      <span>in USDC</span>
                    </ItemValue>
                    <ItemValue>
                      ${showLoader ? <Loader /> : redeemTranche.deusRatio}
                      <span>in vDEUS</span>
                    </ItemValue>
                  </ItemWrapper>
                </InfoWrapper>
              </div>
            </Container>
            <Container>
              <Heading>DEI Bonds stats</Heading>
              <div onClick={() => handleClick(Dashboard.TOTAL_DEI_BONDED)}>
                <InfoWrapper>
                  <p>Total DEI Bonded</p>
                  {deiBonded == 0 ? <Loader /> : <ItemValue>{formatAmount(deiBonded)}</ItemValue>}
                </InfoWrapper>
              </div>
              <div onClick={() => handleClick(Dashboard.TOTAL_BDEI_STAKED)}>
                <InfoWrapper>
                  <p>Total bDEI Staked</p>
                  {totalDeposited == 0 ? <Loader /> : <ItemValue>{formatAmount(totalDeposited)}</ItemValue>}
                </InfoWrapper>
              </div>
              <div onClick={() => handleClick(Dashboard.BDEI_STAKING_APR)}>
                <InfoWrapper>
                  <p>bDEI Staking APR</p>
                  {bDeiSingleStakingAPR == 0 ? <Loader /> : <ItemValue>{bDeiSingleStakingAPR.toFixed(2)}%</ItemValue>}
                </InfoWrapper>
              </div>
              <Container>
                <SubWrapper>
                  <div onClick={() => handleClick(Dashboard.BDEI_LIQUIDITY)}>
                    <InfoWrapper secondary={true}>
                      <p>bDEI Liqudity</p>
                      {sPoolbDEILiquidity === null ? (
                        <Loader />
                      ) : (
                        <ItemValue>{formatAmount(sPoolbDEILiquidity, 2)}</ItemValue>
                      )}
                    </InfoWrapper>
                  </div>
                  <div onClick={() => handleClick(Dashboard.DEI_LIQUIDITY)}>
                    <InfoWrapper secondary={true}>
                      <p>DEI Liquidity</p>
                      {sPoolDEILiquidity == 0 ? (
                        <Loader />
                      ) : (
                        <ItemValue>{formatAmount(sPoolDEILiquidity, 2)}</ItemValue>
                      )}
                    </InfoWrapper>
                  </div>
                </SubWrapper>
                <div onClick={() => handleClick(Dashboard.BDEI_DEI_LIQUIDITY)}>
                  <InfoWrapper>
                    <p>Total bDEI-DEI Liquidity</p>
                    {sPoolLiquidity === null ? <Loader /> : <ItemValue>{formatAmount(sPoolLiquidity, 2)}</ItemValue>}
                  </InfoWrapper>
                </div>
                <div onClick={() => handleClick(Dashboard.BDEI_DEI_STAKING_APR)}>
                  <InfoWrapper>
                    <p>DEI-bDEI Staking APR</p>
                    {bDeiDeiStakingAPR == 0 ? <Loader /> : <ItemValue>{bDeiDeiStakingAPR.toFixed(2)}%</ItemValue>}
                  </InfoWrapper>
                </div>
              </Container>
              <div onClick={() => handleClick(Dashboard.DEI_BOND_MATURITY)}>
                <InfoWrapper>
                  <p>Current Bond maturity</p>
                  {redeemTime == 0 ? <Loader /> : <ItemValue>~ {roundedDays} days</ItemValue>}
                </InfoWrapper>
              </div>
            </Container>
          </StatsWrapper>
        </TopWrapper>
      </Wrapper>
      <StatsModal stat={currentStat} />
    </>
  )
}
