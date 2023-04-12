import { useCallback, useEffect, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { isMobile } from 'react-device-detect'
import { ResponsiveContainer, YAxis, AreaChart, Area, CartesianGrid, Tooltip } from 'recharts'

import { FALLBACK_CHAIN_ID } from 'constants/chains'

import { getPoolStatsApolloClient } from 'apollo/client/poolstats'
import { ChartData, XDEUS_POOL_STATS } from 'apollo/queries'
import { toBN } from 'utils/numbers'

import useWeb3React from 'hooks/useWeb3'
import Dropdown from 'components/DropDown'

const Wrapper = styled.div`
  display: flex;
  width: clamp(250px, 75%, 500px);
  flex-flow: column nowrap;
  padding: 24px 8px;
  border-radius: 12px;
  min-width: 250px;
  height: 492px;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  gap: 12px;
  margin: 0 auto;
  min-height: 420px;
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
    cursor: pointer;
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
interface Option {
  value: string
  label: JSX.Element | string
}

const timeFramesOptions: Option[] = [
  { value: '4H', label: '4 hours' },
  { value: '8H', label: '8 hours' },
  { value: '1D', label: '1 day' },
  { value: '1W', label: '1 week' },
  { value: '1M', label: '1 month' },
  { value: '3M', label: '3 months' },
  { value: '6M', label: '6 months' },
  { value: '1Y', label: '1 year' },
]

// map timeframe to respective seconds
const timeframeMap: Record<string, number> = {
  '4H': 4 * 60 * 60,
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
  '4H': 1 * 60 * 60, // to use 1H grouped data
  '8H': 1 * 60 * 60, // to use 1H grouped data
  '1D': 1 * 60 * 60, // to use 1H grouped data
  '1W': 1 * 60 * 60, // to use 1H grouped data
  '1M': 1 * 24 * 60 * 60, // to use 1d grouped data
  '3M': 1 * 24 * 60 * 60, // to use 1d grouped data
  '6M': 1 * 24 * 60 * 60, // to use 1d grouped data
  '1Y': 1 * 24 * 60 * 60, // to use 1d grouped data
}

interface DataGroup {
  [x: number]: ChartData
}

const tempData: ChartData[] = [
  { timestamp: '001', value: '0.6' },
  { timestamp: '002', value: '0.8' },
  { timestamp: '003', value: '0.9' },
  { timestamp: '004', value: '0.6' },
  { timestamp: '005', value: '0.8' },
  { timestamp: '006', value: '0.7' },
  { timestamp: '007', value: '0.6' },
  { timestamp: '008', value: '0.7' },
  { timestamp: '009', value: '0.8' },
  { timestamp: '091', value: '1.0' },
  { timestamp: '092', value: '0.9' },
  { timestamp: '093', value: '1.1' },
  { timestamp: '094', value: '1.2' },
  { timestamp: '095', value: '1.0' },
  { timestamp: '096', value: '0.8' },
  { timestamp: '097', value: '0.9' },
  { timestamp: '098', value: '1.2' },
  { timestamp: '099', value: '1.0' },
]

export default function SingleChart({ label }: { label: string }) {
  const { chainId = FALLBACK_CHAIN_ID } = useWeb3React()
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>(tempData)
  const [currentTimeFrame, setCurrentTimeFrame] = useState<string>('1M')

  const fetchData = useCallback(async () => {
    const fetcher = async (skip: number, timestamp: number): Promise<ChartData[]> => {
      const DEFAULT_RETURN: ChartData[] = []
      try {
        const client = getPoolStatsApolloClient(chainId)
        if (!client) return DEFAULT_RETURN

        const { data } = await client.query({
          query: XDEUS_POOL_STATS,
          variables: { skip, timestamp },
          fetchPolicy: 'no-cache',
        })

        // fetch respective entity based on selected timeframe
        switch (currentTimeFrame) {
          case '4H':
          case '8H':
          case '1D':
          case '1W':
            return data.vdeusPoolHourlySnapshots.map((obj: { timestamp: any; swapRatio: any }) => ({
              timestamp: obj.timestamp,
              value: toBN(obj.swapRatio).toFixed(3),
            })) as ChartData[]
          case '1M':
          case '3M':
          case '6M':
          case '1Y':
            return data.vdeusPoolDailySnapshots.map((obj: { timestamp: any; swapRatio: any }) => ({
              timestamp: obj.timestamp,
              value: toBN(obj.swapRatio).toFixed(3),
            })) as ChartData[]
          default:
            console.error('Invalid timeframe selected. Defaulting to daily snapshot data.')
            return data.hourlySnapshots as ChartData[]
        }
      } catch (error) {
        console.log(`Unable to query data from The Graph Network`)
        console.error(error)
        return []
      }
    }

    const data: ChartData[] = []
    let skip = 0
    let done = false
    let lastTimestamp = 0
    let timestamp = Math.floor(Date.now() / 1000)

    // if theres more than 5000, get the oldest one his timestamp and then requery with that timestamp
    while (timestamp > Math.floor(Date.now() / 1000) - timeframeMap[currentTimeFrame]) {
      while (!done) {
        const result = await fetcher(skip, timestamp)
        lastTimestamp = parseInt(result[result?.length - 1]?.timestamp)
        data.unshift(...result.reverse())
        if (result.length == 1000) {
          skip = skip + 1000
          if (skip == 5000) done = true
        } else {
          done = true
        }
      }
      done = false
      skip = 0
      timestamp = lastTimestamp
    }
    return data
  }, [chainId, currentTimeFrame])

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData()
      setLoading(!result.length)
      setChartData(result)
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

  // filter data based on selected timeframe
  const filteredData: ChartData[] = useMemo(() => {
    const currentTimestamp = Date.now() / 1000
    const earliestTimestamp = Math.floor(currentTimestamp) - timeframeMap[currentTimeFrame]
    const data = chartData.filter((obj) => parseInt(obj.timestamp) > earliestTimestamp)
    // When there is no CHANGE in value detected in last selected timeframe, add 2 data points same as the last recorded value but with different timestamps
    if (!data.length) {
      data.push(
        {
          ...chartData[chartData.length - 1],
          timestamp: currentTimestamp.toString(),
        },
        {
          ...chartData[chartData.length - 1],
          timestamp: earliestTimestamp.toString(),
        }
      )
    }
    // adding the latest data available as the current data. This is to handle cases where we get just 1 data point in selected timeframe.
    else
      data.push({
        ...data[data.length - 1],
        timestamp: currentTimestamp.toString(),
      })
    // make sure to have not more than 100 data points for any timeframe for smoother chart
    return groupedData(data, currentTimeFrame)
  }, [chartData, currentTimeFrame])

  // lowest and highest values for the Y-axis
  const [lowest = 0, highest = 2000] = useMemo(
    () => [
      Math.floor(Math.min(...filteredData.map((obj) => parseFloat(obj.value))) * 100) / 100, // min is rounded to nearest 0.01
      Math.ceil(Math.max(...filteredData.map((obj) => parseFloat(obj.value))) * 100) / 100, // max is rounded to nearest 0.01
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
        date.getDate() +
        '-' +
        date.toLocaleString('default', { month: 'short' }) +
        '-' +
        date.getFullYear() +
        ' ' +
        date.getHours() +
        ':' +
        date.getMinutes() +
        ' Hr(s)'

      const formattedValue = payload[0].value
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}: ${formattedValue}`}</p>
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
            placeholder={'1 month'}
            defaultValue={'1M'}
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
        content={loading ? 'Loading...' : filteredData.length < 2 ? 'Insufficient data' : ''}
        width="100%"
        height={400}
      >
        <AreaChart data={loading ? tempData : filteredData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.clqdChartPrimaryColor} stopOpacity={1} />
              <stop offset="100%" stopColor={theme.clqdChartSecondaryColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <YAxis
            dataKey="value"
            tick={{ fontSize: '12px' }}
            interval={0}
            tickLine={false}
            axisLine={false}
            domain={[lowest, highest]}
          />
          <CartesianGrid stroke={theme.border2} vertical={false} horizontal={true} />
          <Tooltip content={<CustomTooltip payload={filteredData} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={`url(#fill)`}
            strokeWidth={2}
            fillOpacity={0.75}
            fill={`url(#fill)`}
          />
        </AreaChart>
      </Container>
    </Wrapper>
  )
}
