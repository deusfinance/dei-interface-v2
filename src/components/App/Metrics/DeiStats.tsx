import StatsHeader from 'components/StatsHeader'
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

  // TODO : use actual values from hooks
  const items = [
    { name: 'Price', value: formatDollarAmount(1) ?? '-' },
    { name: 'Supply', value: formatAmount(21530000) ?? '-' },
    { name: 'Market Cap', value: formatDollarAmount(5467530000, 2) ?? '-' },
    { name: 'Minting Ratio', value: '90%' },
    { name: 'Redemption Ratio', value: '85%' },
    { name: 'Collateralization Ratio', value: '90%' },
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
          uniqueID="DEIMarketCap"
        />
        <MultipleChart
          primaryLabel="Minting Ratio"
          secondaryLabel="Redemption Ratio"
          primaryColor={theme.deiPrimaryColor}
          secondaryColor={theme.deiSecondaryColor}
          uniqueID="DEIMintingRatio"
        />
        <MultipleChart
          primaryLabel="Collaterization Ratio"
          secondaryLabel="Total Value(USD)"
          primaryColor={theme.deiPrimaryColor}
          secondaryColor={theme.deiSecondaryColor}
          uniqueID="DEICollaterizationRatio"
        />
      </ChartWrapper>
    </div>
  )
}
