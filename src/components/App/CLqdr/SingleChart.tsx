import { getCLQDRApolloClient } from 'apollo/client/clqdr'
import { ClqdrChartData, CLQDR_DATA } from 'apollo/queries'
import Dropdown from 'components/DropDown'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
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
  min-width: 250px;
  height: 250px;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  gap: 12px;
  min-width: 250px;
  min-height: 300px;
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
  [x: number]: ClqdrChartData
}

const tempData: ClqdrChartData[] = [
  { timestamp: '001', clqdrRatio: '0.6', totalSupply: '200' },
  { timestamp: '002', clqdrRatio: '0.8', totalSupply: '300' },
  { timestamp: '003', clqdrRatio: '0.9', totalSupply: '400' },
  { timestamp: '004', clqdrRatio: '0.6', totalSupply: '600' },
  { timestamp: '005', clqdrRatio: '0.8', totalSupply: '400' },
  { timestamp: '006', clqdrRatio: '0.7', totalSupply: '500' },
  { timestamp: '007', clqdrRatio: '0.6', totalSupply: '300' },
  { timestamp: '008', clqdrRatio: '0.7', totalSupply: '400' },
  { timestamp: '009', clqdrRatio: '0.8', totalSupply: '500' },
  { timestamp: '091', clqdrRatio: '1.0', totalSupply: '600' },
  { timestamp: '092', clqdrRatio: '0.9', totalSupply: '500' },
  { timestamp: '093', clqdrRatio: '1.1', totalSupply: '300' },
  { timestamp: '094', clqdrRatio: '1.2', totalSupply: '400' },
  { timestamp: '095', clqdrRatio: '1.0', totalSupply: '600' },
  { timestamp: '096', clqdrRatio: '0.8', totalSupply: '300' },
  { timestamp: '097', clqdrRatio: '0.9', totalSupply: '400' },
  { timestamp: '098', clqdrRatio: '1.2', totalSupply: '300' },
  { timestamp: '099', clqdrRatio: '1.0', totalSupply: '400' },
]

export default function SingleChart({ label, uniqueID }: { label: string; uniqueID: string }) {
  const { chainId = FALLBACK_CHAIN_ID } = useWeb3React()
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ClqdrChartData[]>(tempData)
  const [currentTimeFrame, setCurrentTimeFrame] = useState<string>('1M')
  const [dataKey, setDataKey] = useState(uniqueID)

  useMemo(() => {
    setDataKey(uniqueID)
  }, [uniqueID])

  const fetchData = useCallback(async () => {
    const fetcher = async (skip: number, timestamp: number): Promise<ClqdrChartData[]> => {
      const DEFAULT_RETURN: ClqdrChartData[] = []
      try {
        const client = getCLQDRApolloClient(chainId)
        if (!client) return DEFAULT_RETURN

        const { data } = await client.query({
          query: CLQDR_DATA,
          variables: { skip, timestamp },
          fetchPolicy: 'no-cache',
        })

        // fetch respective entity based on selected timeframe
        switch (currentTimeFrame) {
          case '4H':
          case '8H':
          case '1D':
          case '1W':
            return data.hourlySnapshots as ClqdrChartData[]
          case '1M':
          case '3M':
          case '6M':
          case '1Y':
            return data.dailySnapshots as ClqdrChartData[]
          default:
            console.error('Invalid timeframe selected. Defaulting to daily snapshot data.')
            return data.hourlySnapshots as ClqdrChartData[]
        }
      } catch (error) {
        console.log(`Unable to query data from The Graph Network`)
        console.error(error)
        return []
      }
    }

    const data: ClqdrChartData[] = []
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
      setChartData(
        result.map((obj) => ({
          ...obj,
          totalSupply: toBN(obj.totalSupply).toFixed(2),
          clqdrRatio: toBN(obj.clqdrRatio).toFixed(3),
        }))
      )
    }
    getData()
  }, [fetchData])

  // group the filtered data based on respective seconds.
  const groupedData = (chartData: ClqdrChartData[], timeframe = '3M'): ClqdrChartData[] => {
    const data = chartData.reduce((arr: DataGroup, data: ClqdrChartData) => {
      const id = Math.floor(parseInt(data.timestamp) / secondsMap[timeframe])
      if (!arr[id]) {
        arr[id] = data
      }
      return arr
    }, {})
    const result: ClqdrChartData[] = Object.values(data)
    return result
  }

  // filter data based on selected timeframe
  const filteredData: ClqdrChartData[] = useMemo(() => {
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
    () =>
      uniqueID === 'totalSupply'
        ? [
            Math.floor(Math.min(...filteredData.map((obj) => parseInt(obj.totalSupply))) / 1000) * 1000, // min is rounded to nearest 1000
            Math.ceil(Math.max(...filteredData.map((obj) => parseInt(obj.totalSupply))) / 1000) * 1000, // max is rounded to nearest 1000
          ]
        : [
            Math.floor(Math.min(...filteredData.map((obj) => parseFloat(obj.clqdrRatio))) * 100) / 100, // min is rounded to nearest 0.01
            Math.ceil(Math.max(...filteredData.map((obj) => parseFloat(obj.clqdrRatio))) * 100) / 100, // max is rounded to nearest 0.01
          ],
    [uniqueID, filteredData]
  )

  const tickFomatter = (value: any): any => {
    if (uniqueID === 'totalSupply') return formatAmount(value, 0)
    return value
  }

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

      const formattedValue = uniqueID === 'totalSupply' ? formatAmount(parseInt(payload[0].value)) : payload[0].value
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
        height={170}
      >
        <AreaChart data={loading ? tempData : filteredData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.clqdChartPrimaryColor} stopOpacity={1} />
              <stop offset="100%" stopColor={theme.clqdChartSecondaryColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <YAxis
            dataKey={dataKey}
            tick={{ fontSize: '12px' }}
            tickFormatter={tickFomatter}
            interval={0}
            tickLine={false}
            axisLine={false}
            domain={[lowest, highest]}
          />
          <CartesianGrid stroke={theme.border3} vertical={false} horizontal={true} />
          <Tooltip content={<CustomTooltip payload={filteredData} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
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
