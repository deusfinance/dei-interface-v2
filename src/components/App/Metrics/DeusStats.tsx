import StatsHeader from 'components/StatsHeader'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useDeusStats } from 'hooks/useDeusStats'
import { useMemo } from 'react'
import styled, { useTheme } from 'styled-components'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import MultipleChart from './MultipleChart'
import SingleChart from './SingleChart'

const Title = styled.div`
  font-size: 20px;
  line-height: 24px;
  text-align: center;
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
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

export default function DeusStats() {
  const theme = useTheme()

  const deusPrice = useDeusPrice()
  const { totalSupply } = useDeusStats()
  const marketCap = useMemo(() => {
    return totalSupply * parseFloat(deusPrice)
  }, [totalSupply, deusPrice])

  const items = [
    { name: 'Price', value: formatDollarAmount(parseInt(deusPrice)) },
    { name: 'Total Supply', value: formatAmount(totalSupply) },
    { name: 'Total Market Cap', value: formatDollarAmount(marketCap) },
  ]

  return (
    <div>
      <Title>DEUS Stats</Title>
      <StatsHeader items={items} />
      <ChartWrapper>
        <SingleChart
          label={'Price'}
          primaryColor={theme.deusPrimaryColor}
          secondaryColor={theme.deusSecondaryColor}
          uniqueID="DEUSPrice"
        />
        <MultipleChart
          primaryLabel="Market Cap"
          secondaryLabel="Total Supply"
          primaryColor={theme.deusPrimaryColor}
          secondaryColor={theme.deusSecondaryColor}
          primaryID="DEUSMarketCap"
          secondaryID="DEUSSupply"
        />
      </ChartWrapper>
    </div>
  )
}
