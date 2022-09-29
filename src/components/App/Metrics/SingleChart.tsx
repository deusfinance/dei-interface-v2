import { formatUnits } from '@ethersproject/units'
import { getApolloClient } from 'apollo/client/deiStats'
import { VeDeusSupply, VEDEUS_SUPPLY } from 'apollo/queries'
import Dropdown from 'components/DropDown'
import { VEDEUS_TOKEN } from 'constants/tokens'
import useWeb3React from 'hooks/useWeb3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ResponsiveContainer, YAxis, AreaChart, Area, CartesianGrid, Tooltip } from 'recharts'
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
  content: string
}>`
  ${({ content, theme }) =>
    content &&
    `
    position: relative;
    &:after {
      content: '${content}';
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      top: 50%;
      transform: translateY(-50%);
      position: absolute;
      color: ${theme.text1};
      backdrop-filter: blur(5px);
      pointer: none;
    }
  `}
`

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
  // { value: 'ALL', label: 'All time' },
]

// map timeframe to respective seconds
const timeframeMap: Record<string, number> = {
  '15m': 15 * 60,
  '1H': 60 * 60,
  '8H': 8 * 60 * 60,
  '1D': 1 * 24 * 60 * 60,
  '1W': 7 * 24 * 60 * 60,
  '1M': 30 * 24 * 60 * 60,
  '3M': 90 * 24 * 60 * 60,
  '6M': 180 * 24 * 60 * 60,
  '1Y': 365 * 24 * 60 * 60,
}

// map respective timeframe to seconds for grouping
const secondsMap: Record<string, number> = {
  '15m': 60, // to use 1m grouped data
  '1H': 60, // to use 1m grouped data
  '8H': 60, // to use 1m grouped data
  '1D': 15 * 60, // to use 15m grouped data
  '1W': 6 * 60 * 60, // to use 6h grouped data
  '1M': 12 * 60 * 60, // to use 12h grouped data
  '3M': 1 * 24 * 60 * 60, // to use 1d grouped data
  '6M': 1 * 24 * 60 * 60, // to use 1d grouped data
  '1Y': 1 * 24 * 60 * 60, // to use 1d grouped data
}

interface ChartData {
  timestamp: string
  value: string
  formattedValue: string
}

interface DataGroup {
  [x: number]: ChartData
}

const tempData: ChartData[] = [
  { timestamp: 'Jan', value: '400', formattedValue: '400' },
  { timestamp: 'Feb', value: '200', formattedValue: '200' },
  { timestamp: 'Mar', value: '700', formattedValue: '700' },
  { timestamp: 'Apr', value: '300', formattedValue: '300' },
  { timestamp: 'May', value: '600', formattedValue: '600' },
  { timestamp: 'Jun', value: '350', formattedValue: '350' },
  { timestamp: 'Jul', value: '400', formattedValue: '400' },
  { timestamp: 'Aug', value: '300', formattedValue: '300' },
  { timestamp: 'Sept', value: '280', formattedValue: '280' },
  { timestamp: 'Oct', value: '400', formattedValue: '400' },
  { timestamp: 'Nov', value: '300', formattedValue: '300' },
  { timestamp: 'Dec', value: '380', formattedValue: '380' },
  { timestamp: 'Jan', value: '250', formattedValue: '250' },
  { timestamp: 'Feb', value: '500', formattedValue: '500' },
  { timestamp: 'Mar', value: '600', formattedValue: '600' },
  { timestamp: 'Apr', value: '400', formattedValue: '400' },
  { timestamp: 'May', value: '600', formattedValue: '600' },
  { timestamp: 'Jun', value: '900', formattedValue: '900' },
]

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
  const theme = useTheme()

  const [chartData, setChartData] = useState<ChartData[]>(tempData)
  const [currentTimeFrame, setCurrentTimeFrame] = useState('3M')

  const fetchData = useCallback(async () => {
    const fetcher = async (skip: number, timestamp: number): Promise<VeDeusSupply[]> => {
      const DEFAULT_RETURN: VeDeusSupply[] = []
      if (uniqueID != 'veDEUSSupply') return DEFAULT_RETURN
      try {
        if (!chainId) return DEFAULT_RETURN
        const client = getApolloClient(chainId)
        if (!client) return DEFAULT_RETURN

        const { data } = await client.query({
          query: VEDEUS_SUPPLY,
          variables: { skip, timestamp },
          fetchPolicy: 'no-cache',
        })

        return data.veDEUSSupplies as VeDeusSupply[]
      } catch (error) {
        console.log('Unable to fetch supply from The Graph Network')
        console.error(error)
        return []
      }
    }

    const data: VeDeusSupply[] = []
    let skip = 0
    let done = false
    const timestamp = Math.floor(Date.now() / 1000)

    while (!done) {
      const result = await fetcher(skip, timestamp)
      data.unshift(...result.reverse())
      if (result.length == 1000) {
        skip = skip + 1000
        if (skip == 5000) done = true
      } else {
        done = true
      }
    }

    // TODO: if theres more than 5000, get the oldest one his timestamp and then requery with that timestamp
    return data
  }, [chainId, uniqueID])

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData()
      setChartData(
        result.map((obj) => ({
          ...obj,
          value: toBN(formatUnits(obj.value, VEDEUS_TOKEN.decimals)).toFixed(0),
          formattedValue: formatAmount(parseInt(formatUnits(obj.value, VEDEUS_TOKEN.decimals))),
        }))
      )
    }
    getData()
  }, [fetchData])

  // group the filtered data based on respective seconds.
  const groupedData = (chartData: ChartData[], timeframe = '3M'): ChartData[] => {
    const data = chartData.reduce((arr: DataGroup, data: ChartData) => {
      const id = Math.floor(parseInt(data.timestamp) / secondsMap[timeframe])
      if (!arr[id]) {
        arr[id] = data
      }
      return arr
    }, {})
    const result: ChartData[] = Object.values(data)
    return result
  }

  const filteredData: ChartData[] = useMemo(() => {
    const earliestTimestamp = Math.floor(Date.now() / 1000) - timeframeMap[currentTimeFrame]
    const filteredData = chartData.filter((obj) => parseInt(obj.timestamp) > earliestTimestamp)
    // make sure to have not more than 100 data points for any timeframe for smoother chart
    return groupedData(filteredData, currentTimeFrame)
  }, [chartData, currentTimeFrame])

  const [lowest = 20, highest = 2340] = useMemo(
    () => [
      Math.min(...filteredData.map((obj) => parseInt(obj.value))),
      Math.max(...filteredData.map((obj) => parseInt(obj.value))),
    ],
    [filteredData]
  )

  const CustomTooltip = ({ payload }: { payload: any }) => {
    if (payload && payload.length) {
      const date = new Date(parseInt(payload[0].payload.timestamp) * 1000)
      // format the date `Sat, 22-May-2020 23:30` format
      const formattedDate =
        date.toLocaleString('default', { weekday: 'short' }) +
        ', ' +
        date.getUTCDate() +
        '-' +
        date.toLocaleString('default', { month: 'short' }) +
        '-' +
        date.getFullYear() +
        ' ' +
        date.getUTCHours() +
        ':' +
        date.getMinutes()
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}: ${payload[0].value}`}</p>
          <p className="intro">{`${formattedDate}`}</p>
        </div>
      )
    }

    return null
  }

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{label}</Title>
        {isMobile ? (
          <Dropdown
            options={timeFramesOptions}
            placeholder={'Select a timeframe'}
            defaultValue={timeFramesOptions[0].value}
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
        content={
          !chartData.length && !filteredData.length ? 'Loading...' : filteredData.length < 2 ? 'Insufficient data' : ''
        }
        width="100%"
        height={350}
      >
        <AreaChart
          data={!chartData.length && !filteredData.length ? tempData : filteredData}
          margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
        >
          <defs>
            <linearGradient id={uniqueID} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <YAxis
            dataKey={'value'}
            tick={{ fontSize: '10px' }}
            interval={0}
            tickLine={true}
            axisLine={false}
            domain={[lowest, highest]}
          />
          <CartesianGrid stroke={theme.border3} vertical={false} horizontal={true} />
          <Tooltip content={<CustomTooltip payload={filteredData} />} />
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
