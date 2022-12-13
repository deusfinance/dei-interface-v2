import StatsHeader from 'components/StatsHeader'
import { useDeiPrice } from 'hooks/useCoingeckoPrice'
import { useDeiStats } from 'hooks/useDeiStats'
import { useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import MultipleChart from './MultipleChart'
import SingleChart from './SingleChart'

const Title = styled.div`
  font-size: 20px;
  line-height: 24px;
  text-align: center;
  background: -webkit-linear-gradient(90deg, #eea85f 0%, #ef3677 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const ChartWrapper = styled.div`
  display: flex;
  margin-top: 24px;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
  & > * {
    flex: 1;
  }
`

export default function DeiStats() {
  const theme = useTheme()

  const deiPrice = useDeiPrice()
  const { totalSupply, totalUSDCReserves } = useDeiStats()
  const marketCap = useMemo(() => {
    return totalSupply * parseFloat(deiPrice)
  }, [totalSupply, deiPrice])
  const collatRatio = useMemo(() => {
    return (totalUSDCReserves / totalSupply) * 100
  }, [totalSupply, totalUSDCReserves])

  const items = [
    { name: 'Price', value: formatDollarAmount(parseFloat(deiPrice), 3) },
    { name: 'Supply', value: formatAmount(totalSupply) },
    { name: 'Market Cap', value: formatDollarAmount(marketCap, 2) },
    { name: 'Total Reserve Assets', value: formatDollarAmount(totalUSDCReserves) },
    { name: 'Collateralization Ratio', value: formatAmount(collatRatio, 2) + '%' },
  ]

  return (
    <div>
      <Title>DEI Stats</Title>
      <StatsHeader items={items} />
      <ChartWrapper>
        <SingleChart
          label={'Price'}
          primaryColor={theme.deiPrimaryColor}
          secondaryColor={theme.deiSecondaryColor}
          uniqueID="DEIPrice"
        />
        <MultipleChart
          primaryLabel="Market Cap"
          secondaryLabel="Supply"
          primaryColor={theme.deiPrimaryColor}
          secondaryColor={theme.deiSecondaryColor}
          primaryID="DEIMarketCap"
          secondaryID="DEISupply"
        />
        <MultipleChart
          primaryLabel="Minting Ratio"
          secondaryLabel="Redemption Ratio"
          primaryColor={theme.deiPrimaryColor}
          secondaryColor={theme.deiSecondaryColor}
          primaryID="DEIMintingRatio"
          secondaryID="DEIRdemptionRatio"
        />
        <MultipleChart
          primaryLabel="Collaterization Ratio"
          secondaryLabel="Total Value(USD)"
          primaryColor={theme.deiPrimaryColor}
          secondaryColor={theme.deiSecondaryColor}
          primaryID="DEICollaterizationRatio"
          secondaryID="DEIReservesTotalValue"
        />
      </ChartWrapper>
    </div>
  )
}
