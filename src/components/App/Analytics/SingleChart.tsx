import { useState } from 'react'
import { ResponsiveContainer, YAxis, AreaChart, Area, CartesianGrid } from 'recharts'
import styled, { useTheme } from 'styled-components'

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
  const loading = false
  const theme = useTheme()

  const timeFrames = ['15m', '1H', '8H', '1D', '1W', '1M', '3M', '6M', '1Y', 'ALL']
  const [currentTimeFrame, setCurrentTimeFrame] = useState('3M')

  // TODO : Using subgraph data
  // to be fetched from subgraph api endpoint for default tab and default timeframe and selected label
  // format is important. this format has to be followed at subgraph API when returning the result
  const data = [
    { month: 'Jan', value: 200, score: 200 },
    { month: 'Feb', value: 500, score: 500 },
    { month: 'Mar', value: 212, score: 212 },
    { month: 'Apr', value: 900, score: 900 },
    { month: 'May', value: 300, score: 300 },
    { month: 'Jun', value: 543, score: 543 },
    { month: 'Jul', value: 1000, score: 1000 },
    { month: 'Aug', value: 99, score: 99 },
    { month: 'Sept', value: 894, score: 894 },
    { month: 'Oct', value: 0, score: 0 },
    { month: 'Nov', value: 542, score: 542 },
    { month: 'Dec', value: 123, score: 123 },
    { month: 'Jan', value: 986, score: 986 },
    { month: 'Feb', value: 432, score: 432 },
    { month: 'Mar', value: 1543, score: 1543 },
    { month: 'Apr', value: 1052, score: 2552 },
    { month: 'May', value: 2000, score: 2000 },
    { month: 'Jun', value: 234, score: 234 },
  ]

  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{label}</Title>
        <TimeframeWrapper>
          {timeFrames.map((timeframe, index) => (
            <Item key={index} active={currentTimeFrame == timeframe} onClick={() => setCurrentTimeFrame(timeframe)}>
              {timeframe}
            </Item>
          ))}
        </TimeframeWrapper>
      </TitleWrapper>
      <Container
        loading={loading}
        content={!data.length ? 'Chart is not available' : loading ? 'Loading...' : ''}
        width="100%"
        height={350}
      >
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
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
