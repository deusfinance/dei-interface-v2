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
import { toBN } from 'utils/numbers'

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

  const [chartData, setChartData] = useState<VeDeusSupply[]>([])
  const [currentTimeFrame, setCurrentTimeFrame] = useState('1Y')

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

        console.log('the data: ', data)

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
    console.log('ALL DATA', data)
    console.log('oldest', data[0])
    console.log('youungest', data[data.length - 1])

    // TODO: if theres more than 5000, get the oldest one his timestamp and then requery with that timestamp
    return data
  }, [chainId, uniqueID])

  useEffect(() => {
    const getData = async () => {
      const result = await fetchData()
      setChartData(
        result.map((obj) => ({
          ...obj,
          value: toBN(formatUnits(obj.value, VEDEUS_TOKEN.decimals)).toFixed(2),
        }))
      )
    }
    getData()
  }, [fetchData])

  const filteredData: VeDeusSupply[] = useMemo(() => {
    const earliestTimestamp = Math.floor(Date.now() / 1000) - timeframeMap[currentTimeFrame]
    console.log('the earliest: ', earliestTimestamp)
    return chartData.filter((obj) => parseInt(obj.timestamp) > earliestTimestamp)
  }, [chartData, currentTimeFrame])

  const [lowest, highest] = useMemo(
    () => [
      Math.min(...filteredData.map((obj) => parseInt(obj.value))),
      Math.max(...chartData.map((obj) => parseInt(obj.value))),
    ],
    [chartData, filteredData]
  )

  console.log('lowest', lowest)
  console.log('highest', highest)

  const tempData = [
    { timestamp: 'Jan', value: 800 },
    { timestamp: 'Feb', value: 200 },
    { timestamp: 'Mar', value: 680 },
    { timestamp: 'Apr', value: 900 },
    { timestamp: 'May', value: 300 },
    { timestamp: 'Jun', value: 943 },
    { timestamp: 'Jul', value: 1000 },
    { timestamp: 'Aug', value: 300 },
    { timestamp: 'Sept', value: 100 },
    { timestamp: 'Oct', value: 220 },
    { timestamp: 'Nov', value: 600 },
    { timestamp: 'Dec', value: 200 },
    { timestamp: 'Jan', value: 100 },
    { timestamp: 'Feb', value: 20 },
    { timestamp: 'Mar', value: 400 },
    { timestamp: 'Apr', value: 1052 },
    { timestamp: 'May', value: 600 },
    { timestamp: 'Jun', value: 2340 },
  ]

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
        loading={loading}
        content={tempData.length == 0 ? 'Chart is not available' : loading ? 'Loading...' : ''}
        width="100%"
        height={350}
      >
        <AreaChart data={tempData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <defs>
            <linearGradient id={uniqueID} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <YAxis tick={{ fontSize: '12px' }} interval={0} tickLine={true} axisLine={false} domain={[lowest, highest]} />
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
