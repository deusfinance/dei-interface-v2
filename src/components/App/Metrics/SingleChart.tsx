import { formatUnits } from '@ethersproject/units'
import { getApolloClient } from 'apollo/client/deiStats'
import { VeDeusSupply, VEDEUS_SUPPLY } from 'apollo/queries'
import Dropdown from 'components/DropDown'
import { VEDEUS_TOKEN } from 'constants/tokens'
import useWeb3React from 'hooks/useWeb3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ResponsiveContainer, YAxis, AreaChart, Area, CartesianGrid } from 'recharts'
import styled, { useTheme } from 'styled-components'
import { formatAmount, toBN } from 'utils/numbers'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column nowrap;
  padding: 24px 8px;
  border-radius: 12px;
  min-width: 600px;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  gap: 12px;
  min-width: 350px;
`};
`

const TitleWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0px 8px;
  margin-bottom: 24px;
  align-items: center;
`

const Title = styled.div`
  font-family: Inter;
  font-weight: 600;
`

const TimeframeWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 8px;
`

const Item = styled.div<{
  active?: boolean
}>`
  font-size: 12px;
  color: ${({ theme }) => theme.text2};

  ${({ active, theme }) =>
    active &&
    `
        color: ${theme.text1};
    `}

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
`

const Container = styled(ResponsiveContainer)<{
  loading: boolean
  content: string
}>`
  ${({ content, theme }) =>
    content &&
    `
      position: relative;
      &:after {
        content: '${content}';
        display: flex;
        justify-content: center;
        width: 100%;
        height: 350px;
        color: ${theme.bg0};
        opacity: 0.2;
        pointer-events: none;
      }
    `}
`

interface DataGroup {
  [x: number]: VeDeusSupply
}

export default function SingleChart({
  label,
  primaryColor,
  secondaryColor,
  uniqueID,
}: {
  label: string
  primaryColor: string
  secondaryColor: string
  uniqueID: string
}) {
  const { chainId } = useWeb3React()
  const loading = false
  const theme = useTheme()

  const [chartData, setChartData] = useState<VeDeusSupply[] | []>([])

  const timeFramesOptions = [
    { value: '15m', label: '15 mins' },
    { value: '1H', label: '1 hour' },
    { value: '8H', label: '8 hours' },
    { value: '1D', label: '1 day' },
    { value: '1W', label: '1 week' },
    { value: '1M', label: '1 month' },
    { value: '3M', label: '3 months' },
    { value: '6M', label: '6 months' },
    { value: '1Y', label: '1 year' },
    { value: 'ALL', label: 'All time' },
  ]
  const [currentTimeFrame, setCurrentTimeFrame] = useState('3M')

  // TODO : Using subgraph data
  // to be fetched from subgraph api endpoint for default tab and default timeframe and selected label
  // format is important. this format has to be followed at subgraph API when returning the result
  // const data = [
  //   { month: 'Jan', value: 200, score: 200 },
  //   { month: 'Feb', value: 500, score: 500 },
  //   { month: 'Mar', value: 212, score: 212 },
  //   { month: 'Apr', value: 900, score: 900 },
  //   { month: 'May', value: 300, score: 300 },
  //   { month: 'Jun', value: 543, score: 543 },
  //   { month: 'Jul', value: 1000, score: 1000 },
  //   { month: 'Aug', value: 99, score: 99 },
  //   { month: 'Sept', value: 894, score: 894 },
  //   { month: 'Oct', value: 0, score: 0 },
  //   { month: 'Nov', value: 542, score: 542 },
  //   { month: 'Dec', value: 123, score: 123 },
  //   { month: 'Jan', value: 986, score: 986 },
  //   { month: 'Feb', value: 432, score: 432 },
  //   { month: 'Mar', value: 1543, score: 1543 },
  //   { month: 'Apr', value: 1052, score: 2552 },
  //   { month: 'May', value: 2000, score: 2000 },
  //   { month: 'Jun', value: 234, score: 234 },
  // ]

  const fetchData = useCallback(async () => {
    const DEFAULT_RETURN: VeDeusSupply[] = []
    if (uniqueID != 'veDEUSSupply') return DEFAULT_RETURN
    try {
      if (!chainId) return DEFAULT_RETURN
      const client = getApolloClient(chainId)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: VEDEUS_SUPPLY,
        fetchPolicy: 'no-cache',
      })

      return data.veDEUSSupplies as VeDeusSupply[]
    } catch (error) {
      console.log('Unable to fetch supply from The Graph Network')
      console.error(error)
      return []
    }
  }, [chainId])

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData()
      result.forEach((obj) => {
        obj.value = toBN(formatUnits(obj.value, VEDEUS_TOKEN.decimals)).toFixed(2)
      })
      setChartData(result)
    }
    getData()
  }, [fetchData])

  // group txs based on txs in a single day
  const groupedChartData: VeDeusSupply[] = useMemo(() => {
    const data = chartData.reduce((arr: DataGroup, data: VeDeusSupply) => {
      const id = Math.floor(parseInt(data.timestamp) / 86400)
      if (!arr[id]) {
        arr[id] = data
      }
      return arr
    }, {})
    const result: VeDeusSupply[] = Object.values(data)
    return result
    //return flat.sort((arr1, arr2) => (Number(arr1[0].timestamp) > Number(arr2[0].timestamp) ? -1 : 1))
  }, [chartData])

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{label}</Title>
        {isMobile ? (
          <Dropdown
            options={timeFramesOptions}
            placeholder={'Select a timeframe'}
            defaultValue={timeFramesOptions[6].value}
            onSelect={setCurrentTimeFrame}
            width={'120px'}
          />
        ) : (
          <TimeframeWrapper>
            {timeFramesOptions.map((timeframe, index) => (
              <Item
                key={index}
                active={currentTimeFrame == timeframe.value}
                onClick={() => setCurrentTimeFrame(timeframe.value)}
              >
                {timeframe.value}
              </Item>
            ))}
          </TimeframeWrapper>
        )}
      </TitleWrapper>
      <Container
        loading={loading}
        content={groupedChartData.length == 0 ? 'Chart is not available' : loading ? 'Loading...' : ''}
        width="100%"
        height={350}
      >
        <AreaChart data={groupedChartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <defs>
            <linearGradient id={uniqueID} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <YAxis tick={{ fontSize: '12px' }} interval={0} tickLine={false} axisLine={false} />
          <CartesianGrid stroke={theme.border3} vertical={false} horizontal={true} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={`url(#${uniqueID})`}
            strokeWidth={2}
            fillOpacity={0.75}
            fill={`url(#${uniqueID})`}
          />
        </AreaChart>
      </Container>
    </Wrapper>
  )
}
