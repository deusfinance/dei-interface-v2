import { formatUnits } from '@ethersproject/units'
import { getDeiStatsApolloClient } from 'apollo/client/deiStats'
import { getDeusStatsApolloClient } from 'apollo/client/deusStats'
import { ChartData, DEI_REDEMPTION_RATIOS, DEI_RESERVES_BALANCE, DEI_SUPPLY, DEUS_SUPPLY } from 'apollo/queries'
import Dropdown from 'components/DropDown'
import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
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
  background: ${({ theme }) => theme.bg3};

  ${({ active, theme }) =>
    active &&
    ` 
        color: ${theme.text1};
        backdrop-filter: blur(12px);
        background: ${theme.bg2};
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
  background: ${({ theme }) => theme.bg3};

  ${({ active, theme }) =>
    active &&
    ` 
        color: ${theme.text1};
        backdrop-filter: blur(12px);
        background: ${theme.bg2};
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
  const { chainId } = useWeb3React()
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>(temp1Data)
  const [currentTimeFrame, setCurrentTimeFrame] = useState('1M')
  const [currentTab, setCurrentTab] = useState(primaryLabel)

  const currentTempData = useMemo(() => {
    return currentTab === primaryLabel ? temp1Data : temp2Data
  }, [currentTab, primaryLabel])

  const currentID = useMemo(() => {
    return currentTab === primaryLabel ? primaryID : secondaryID
  }, [currentTab, primaryLabel, primaryID, secondaryID])

  const fetchData = useCallback(async () => {
    const fetcher = async (skip: number, timestamp: number): Promise<ChartData[]> => {
      const DEFAULT_RETURN: ChartData[] = []
      try {
        if (!chainId) return DEFAULT_RETURN

        // query different subgraphs and respective schemas to fetch respective chart data
        switch (currentID) {
          case 'DEIRdemptionRatio': {
            const client = getDeiStatsApolloClient(chainId)
            if (!client) return DEFAULT_RETURN

            const { data } = await client.query({
              query: DEI_REDEMPTION_RATIOS,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            const result: ChartData[] = data.redeemRatios as ChartData[]

            return result.map((obj) => ({
              ...obj,
              value: toBN(formatUnits(obj.value, 6)).toFixed(2),
            }))
          }
          case 'DEIReservesTotalValue': {
            const client = getDeiStatsApolloClient(chainId)
            if (!client) return DEFAULT_RETURN

            const { data } = await client.query({
              query: DEI_RESERVES_BALANCE,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            const result: ChartData[] = data.deipollUSDCBalances as ChartData[]

            return result.map((obj) => ({
              ...obj,
              value: toBN(formatUnits(obj.value, USDC_TOKEN.decimals)).toFixed(0),
            }))
          }
          case 'DEISupply': {
            const client = getDeiStatsApolloClient(chainId)
            if (!client) return DEFAULT_RETURN

            const { data } = await client.query({
              query: DEI_SUPPLY,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            const result: ChartData[] = data.deisupplies as ChartData[]

            return result.map((obj) => ({
              ...obj,
              value: toBN(formatUnits(obj.value, DEI_TOKEN.decimals)).toFixed(0),
            }))
          }
          case 'DEUSSupply': {
            const client = getDeusStatsApolloClient(chainId)
            if (!client) return DEFAULT_RETURN

            const { data } = await client.query({
              query: DEUS_SUPPLY,
              variables: { skip, timestamp },
              fetchPolicy: 'no-cache',
            })

            const result: ChartData[] = data.deussupplies as ChartData[]

            return result.map((obj) => ({
              ...obj,
              value: toBN(formatUnits(obj.value, DEUS_TOKEN.decimals)).toFixed(0),
            }))
          }
          default:
            return []
        }
      } catch (error) {
        console.log(`Unable to ${currentID} data from The Graph Network`)
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
  }, [currentID, chainId, currentTimeFrame])

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
    // adding the latest data available as the current data. This is to handle cases where we get just 1 data point in selected timeframe.
    filteredData.push(...filteredData, {
      ...filteredData[filteredData.length - 1],
      timestamp: currentTimestamp.toString(),
    })
    // make sure to have not more than 100 data points for any timeframe for smoother chart
    return groupedData(filteredData, currentTimeFrame)
  }, [chartData, currentTimeFrame])

  // lowest and highest values for the Y-axis
  const [lowest = 20, highest = 2340] = useMemo(
    () => [
      Math.floor(Math.min(...filteredData.map((obj) => parseInt(obj.value))) / 10) * 10, // min is rounded to nearest 10
      Math.ceil(Math.max(...filteredData.map((obj) => parseInt(obj.value))) / 10) * 10, // max is rounded to nearest 10
    ],
    [filteredData]
  )

  console.log('data', filteredData)

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
      const formattedValue = formatAmount(parseInt(payload[0].value))
      return (
        <div className="custom-tooltip">
          <p className="label">{`${currentTab}: ${formattedValue}`}</p>
          <p className="intro">{`${formattedDate}`}</p>
        </div>
      )
    }

    return null
  }

  return (
    <Wrapper>
      <TitleWrapper>
        <LabelWrapper>
          <PrimaryLabel
            active={currentTab === primaryLabel}
            onClick={() => {
              setCurrentTab(primaryLabel)
              setChartData(temp1Data)
            }}
          >
            {primaryLabel}
          </PrimaryLabel>
          <SecondaryLabel
            active={currentTab === secondaryLabel}
            onClick={() => {
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
        content={loading ? 'Loading...' : filteredData.length < 1 ? 'Insufficient data' : ''}
        width="100%"
        height={350}
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
