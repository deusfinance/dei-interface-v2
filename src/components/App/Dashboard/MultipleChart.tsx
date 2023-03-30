import { getDeiPriceStatsApolloClient } from 'apollo/client/deiPriceStats'
import { getEcosystemStatsApolloClient } from 'apollo/client/ecosystemStats'
import {
  ChartData,
  DAILY_DEI_PRICE_STATS,
  DAILY_ECOSYSTEM_STATS,
  HOURLY_DEI_PRICE_STATS,
  HOURLY_ECOSYSTEM_STATS,
} from 'apollo/queries'
import Dropdown from 'components/DropDown'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import useWeb3React from 'hooks/useWeb3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ResponsiveContainer, YAxis, AreaChart, Area, CartesianGrid, Tooltip } from 'recharts'
import styled, { useTheme } from 'styled-components'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 400px;
  flex-flow: column nowrap;
  padding: 24px 8px;
  border-radius: 12px;
  min-width: 600px;
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
  margin-top: -8px;
  align-items: center;
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

const LabelWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  font-family: Inter;
  font-size: 12px;
  line-height: 16px;
`

const PrimaryLabel = styled.div<{
  active?: boolean
}>`
  display: flex;
  padding: 12px 16px;
  min-width: 60px;
  border-radius: 8px 0px 0px 8px;
  border: 1px solid ${({ theme }) => theme.border1};
  border-right: 1px solid transparent;
  color: ${({ theme }) => theme.text2};
  background: ${({ theme }) => theme.bg0};

  ${({ active, theme }) =>
    active &&
    ` 
        color: ${theme.bg0};
        backdrop-filter: blur(12px);
        background: ${theme.bg4};
    `}

  &: hover {
    color: ${({ theme }) => theme.text1};
  }
`
const SecondaryLabel = styled.div<{
  active?: boolean
}>`
  display: flex;
  padding: 12px 16px;
  min-width: 60px;
  border-radius: 0px 8px 8px 0px;
  border-left: 1px solid transparent;
  border: 1px solid ${({ theme }) => theme.border1};
  color: ${({ theme }) => theme.text2};
  background: ${({ theme }) => theme.bg0};

  ${({ active, theme }) =>
    active &&
    ` 
        color: ${theme.bg0};
        backdrop-filter: blur(12px);
        background: ${theme.bg4};
    `}

  &: hover {
    color: ${({ theme }) => theme.text1};
  }
`

const timeFramesOptions = [
  { value: '4H', label: '4 hours' },
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
  '4H': 60, // to use 1m grouped data
  '8H': 60, // to use 1m grouped data
  '1D': 15 * 60, // to use 15m grouped data
  '1W': 6 * 60 * 60, // to use 6h grouped data
  '1M': 12 * 60 * 60, // to use 12h grouped data
  '3M': 1 * 24 * 60 * 60, // to use 1d grouped data
  '6M': 1 * 24 * 60 * 60, // to use 1d grouped data
  '1Y': 1 * 24 * 60 * 60, // to use 1d grouped data
}

interface DataGroup {
  [x: number]: ChartData
}

const temp1Data: ChartData[] = [
  { timestamp: 'Jan', value: '400' },
  { timestamp: 'Feb', value: '200' },
  { timestamp: 'Mar', value: '700' },
  { timestamp: 'Apr', value: '300' },
  { timestamp: 'May', value: '600' },
  { timestamp: 'Jun', value: '350' },
  { timestamp: 'Jul', value: '400' },
  { timestamp: 'Aug', value: '300' },
  { timestamp: 'Sep', value: '280' },
  { timestamp: 'Oct', value: '400' },
  { timestamp: 'Nov', value: '300' },
  { timestamp: 'Dec', value: '380' },
  { timestamp: 'Jan', value: '250' },
  { timestamp: 'Feb', value: '500' },
  { timestamp: 'Mar', value: '600' },
  { timestamp: 'Apr', value: '400' },
  { timestamp: 'May', value: '600' },
  { timestamp: 'Jun', value: '900' },
]

const temp2Data: ChartData[] = [
  { timestamp: 'Mar', value: '700' },
  { timestamp: 'Apr', value: '300' },
  { timestamp: 'May', value: '600' },
  { timestamp: 'Jan', value: '400' },
  { timestamp: 'Feb', value: '200' },
  { timestamp: 'Sep', value: '280' },
  { timestamp: 'Oct', value: '400' },
  { timestamp: 'Nov', value: '300' },
  { timestamp: 'Jun', value: '350' },
  { timestamp: 'Jul', value: '400' },
  { timestamp: 'Aug', value: '300' },
  { timestamp: 'Mar', value: '600' },
  { timestamp: 'Apr', value: '400' },
  { timestamp: 'May', value: '600' },
  { timestamp: 'Jun', value: '900' },
  { timestamp: 'Dec', value: '380' },
  { timestamp: 'Jan', value: '250' },
  { timestamp: 'Feb', value: '500' },
]

export default function MultipleChart({
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
  primaryID,
  secondaryID,
}: {
  primaryLabel: string
  secondaryLabel: string
  primaryColor: string
  secondaryColor: string
  primaryID: string
  secondaryID: string
}) {
  const { chainId = FALLBACK_CHAIN_ID } = useWeb3React()
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>(temp1Data)
  const [currentTimeFrame, setCurrentTimeFrame] = useState('1Y')
  const [currentTab, setCurrentTab] = useState(primaryLabel)
  const [lowest, setLowest] = useState(0)
  const [highest, setHighest] = useState(2400)

  const currentTempData = useMemo(() => {
    return currentTab === primaryLabel ? temp1Data : temp2Data
  }, [currentTab, primaryLabel])

  const currentID = useMemo(() => {
    return currentTab === primaryLabel ? primaryID : secondaryID
  }, [currentTab, primaryLabel, primaryID, secondaryID])

  const getRawData = useCallback(
    async (skip: number, timestamp: number) => {
      try {
        // query subgraph and fetch all entities at once
        if (currentID === 'deiSupply') {
          const deiSupplyClient = getEcosystemStatsApolloClient(FALLBACK_CHAIN_ID)
          if (!deiSupplyClient) return []

          if (
            currentTimeFrame === '4H' ||
            currentTimeFrame === '8H' ||
            currentTimeFrame === '1D' ||
            currentTimeFrame === '1W'
          ) {
            const { data } = await deiSupplyClient.query({
              query: HOURLY_ECOSYSTEM_STATS,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            return data
          } else {
            const { data } = await deiSupplyClient.query({
              query: DAILY_ECOSYSTEM_STATS,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            return data
          }
        } else {
          const deiPriceClient = getDeiPriceStatsApolloClient(FALLBACK_CHAIN_ID)
          if (!deiPriceClient) return []

          if (
            currentTimeFrame === '4H' ||
            currentTimeFrame === '8H' ||
            currentTimeFrame === '1D' ||
            currentTimeFrame === '1W'
          ) {
            const { data } = await deiPriceClient.query({
              query: HOURLY_DEI_PRICE_STATS,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            return data
          } else {
            const { data } = await deiPriceClient.query({
              query: DAILY_DEI_PRICE_STATS,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            return data
          }
        }
      } catch (error) {
        console.log(`Unable to query data from The Graph Network`)
        console.error(error)
        return []
      }
    },
    [chainId, currentTimeFrame, currentID]
  )

  const fetchData = useCallback(async () => {
    const fetcher = async (skip: number, timestamp: number): Promise<ChartData[]> => {
      const data = await getRawData(skip, timestamp)

      // fetch respective entity based on selected timeframe
      switch (currentID) {
        case 'deiSupply':
          if (
            currentTimeFrame === '4H' ||
            currentTimeFrame === '8H' ||
            currentTimeFrame === '1D' ||
            currentTimeFrame === '1W'
          )
            return data.hourlyDEISupplySnapshots.map((obj: { deiSupply: any; timestamp: any }) => ({
              timestamp: obj.timestamp,
              value: obj.deiSupply,
            })) as ChartData[]
          else
            return data.dailyDEISupplySnapshots.map((obj: { deiSupply: any; timestamp: any }) => ({
              timestamp: obj.timestamp,
              value: obj.deiSupply,
            })) as ChartData[]
        case 'deiPrice':
          if (
            currentTimeFrame === '4H' ||
            currentTimeFrame === '8H' ||
            currentTimeFrame === '1D' ||
            currentTimeFrame === '1W'
          )
            return data.hourlyDeiTokenPriceSnapshots.map((obj: { deiPrice: any; timestamp: any }) => ({
              timestamp: obj.timestamp,
              value: obj.deiPrice,
            })) as ChartData[]
          else
            return data.dailyDeiTokenPriceSnapshots.map((obj: { deiPrice: any; timestamp: any }) => ({
              timestamp: obj.timestamp,
              value: obj.deiPrice,
            })) as ChartData[]
        default:
          console.error('Invalid timeframe selected. Defaulting to daily snapshot data.')
          return [] as ChartData[]
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
  }, [currentTimeFrame, getRawData, currentID])

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
    const filteredData = chartData.filter((obj) => parseInt(obj.timestamp) > earliestTimestamp)
    // When there is no CHANGE in value detected in last selected timeframe, add 2 data points same as the last recorded value but with different timestamps
    if (!filteredData.length) {
      filteredData.push(
        ...filteredData,
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
      filteredData.push(...filteredData, {
        ...filteredData[filteredData.length - 1],
        timestamp: currentTimestamp.toString(),
      })
    // make sure to have not more than 100 data points for any timeframe for smoother chart
    return groupedData(filteredData, currentTimeFrame)
  }, [chartData, currentTimeFrame])

  // lowest and highest values for the Y-axis
  useMemo(() => {
    if (currentID === 'deiSupply') {
      setLowest(Math.floor(Math.min(...filteredData.map((obj) => parseInt(obj.value))) / 100000) * 100000 * 0.5) // min is rounded to nearest 50% of 100k
      setHighest(Math.ceil(Math.max(...filteredData.map((obj) => parseInt(obj.value))) / 100000) * 100000) // max is rounded to nearest 100k
    } else if (currentID === 'deiPrice') {
      setLowest(0.95)
      setHighest(1.05)
      //setLowest(Math.floor(Math.min(...filteredData.map((obj) => parseFloat(obj.value))) * 1000) / 1000) // min is rounded to nearest 0.0001
      //setHighest(Math.ceil(Math.max(...filteredData.map((obj) => parseFloat(obj.value))) * 1000) / 1000) // max is rounded to nearest 0.0001
    }
  }, [filteredData, currentID])

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
        date.getMinutes() +
        ' Hr(s)'
      const formattedValue =
        currentID === 'deiSupply'
          ? formatAmount(parseFloat(payload[0].value), 2)
          : '$' + formatAmount(parseFloat(payload[0].value), 3)
      return (
        <div className="custom-tooltip">
          <p className="label">{`${currentTab}: ${formattedValue}`}</p>
          <p className="intro">{`${formattedDate}`}</p>
        </div>
      )
    }

    return null
  }

  const tickFomatter = (value: any): any => {
    if (currentID === 'deiSupply') return formatAmount(value, 0)
    return formatDollarAmount(value, 3)
  }

  return (
    <Wrapper>
      <TitleWrapper>
        <LabelWrapper>
          <PrimaryLabel
            active={currentTab === primaryLabel}
            onClick={() => {
              setLoading(true)
              setCurrentTab(primaryLabel)
              setChartData(temp1Data)
            }}
          >
            {primaryLabel}
          </PrimaryLabel>
          <SecondaryLabel
            active={currentTab === secondaryLabel}
            onClick={() => {
              setLoading(true)
              setCurrentTab(secondaryLabel)
              setChartData(temp2Data)
            }}
          >
            {secondaryLabel}
          </SecondaryLabel>
        </LabelWrapper>
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
        content={loading ? 'Loading...' : filteredData.length < 2 ? 'Insufficient data' : ''}
        width="100%"
        height={300}
      >
        <AreaChart data={loading ? currentTempData : filteredData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <defs>
            <linearGradient id={primaryID} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <YAxis
            dataKey={'value'}
            tick={{ fontSize: '10px' }}
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
            dataKey="value"
            stroke={`url(#${primaryID})`}
            strokeWidth={2}
            fillOpacity={0.75}
            fill={`url(#${primaryID})`}
          />
        </AreaChart>
      </Container>
    </Wrapper>
  )
}
