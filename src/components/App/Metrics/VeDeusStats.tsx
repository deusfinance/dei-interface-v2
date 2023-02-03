import StatsHeader from 'components/StatsHeader'
import styled, { useTheme } from 'styled-components'
import { formatAmount } from 'utils/numbers'

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

export default function VeDeusStats() {
  const theme = useTheme()

  // TODO : use actual values from hooks
  const items = [
    { name: 'Supply', value: formatAmount(1530000) ?? '-' },
    { name: 'Total veDEUS Locked', value: formatAmount(1530000) ?? '-' },
    { name: 'Avg Lock Period', value: '4yrs' ?? '-' },
    { name: 'APR', value: '34%' ?? '-' },
  ]

  return (
    <div>
      <Title>veDEUS Stats</Title>
      <StatsHeader items={items} />
      <ChartWrapper>
        <SingleChart
          label={'Supply'}
          primaryColor={theme.deusPrimaryColor}
          secondaryColor={theme.deusSecondaryColor}
          uniqueID="veDEUSSupply"
        />
        <SingleChart
          label={'Total Locked'}
          primaryColor={theme.deusPrimaryColor}
          secondaryColor={theme.deusSecondaryColor}
          uniqueID="veDEUSTotalLocked"
        />
      </ChartWrapper>
    </div>
  )
}
