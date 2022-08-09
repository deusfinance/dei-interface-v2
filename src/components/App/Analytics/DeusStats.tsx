import StatsHeader from 'components/StatsHeader'
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

  // TODO : use actual values from hooks
  const items = [
    { name: 'Price', value: formatDollarAmount(89) ?? '-' },
    { name: 'Supply', value: formatAmount(121530000) ?? '-' },
    { name: 'Market Cap', value: formatDollarAmount(15467530000, 2) ?? '-' },
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
          uniqueID="DEUS"
        />
        <MultipleChart
          primaryLabel="Market Cap"
          secondaryLabel="Supply"
          primaryColor={theme.deusPrimaryColor}
          secondaryColor={theme.deusSecondaryColor}
          uniqueID="DEUS"
        />
      </ChartWrapper>
    </div>
  )
}
