import Dropdown from 'components/DropDown'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { ResponsiveContainer, YAxis, AreaChart, Area, CartesianGrid } from 'recharts'
import styled, { useTheme } from 'styled-components'

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

export default function MultipleChart({
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
  uniqueID,
}: {
  primaryLabel: string
  secondaryLabel: string
  primaryColor: string
  secondaryColor: string
  uniqueID: string
}) {
  const theme = useTheme()
  const loading = false
  const [currentTab, setCurrentTab] = useState(primaryLabel)

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

  // TODO :  Use subgraph data
  // to be fetched from subgraph api endpoint for default tab and default timeframe and selected label
  // format is important. this format has to be followed at subgraph API when returning the result
  const primaryData = [
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

  const secondaryData = [
    { month: 'Jan', value: 200, score: 200 },
    { month: 'Feb', value: 560, score: 560 },
    { month: 'Mar', value: 670, score: 670 },
    { month: 'Apr', value: 340, score: 340 },
    { month: 'May', value: 450, score: 450 },
    { month: 'Jun', value: 200, score: 200 },
    { month: 'Jul', value: 590, score: 590 },
    { month: 'Aug', value: 500, score: 500 },
    { month: 'Sept', value: 1090, score: 1090 },
    { month: 'Oct', value: 1600, score: 1600 },
    { month: 'Nov', value: 1200, score: 1200 },
    { month: 'Dec', value: 1400, score: 1400 },
    { month: 'Jan', value: 2000, score: 2000 },
    { month: 'Feb', value: 1600, score: 1600 },
    { month: 'Mar', value: 1800, score: 1800 },
    { month: 'Apr', value: 1300, score: 1300 },
    { month: 'May', value: 1700, score: 1700 },
    { month: 'Jun', value: 1100, score: 1100 },
  ]

  const [currentData, setCurrentData] = useState(primaryData)

  return (
    <Wrapper>
      <TitleWrapper>
        <LabelWrapper>
          <PrimaryLabel
            active={currentTab === primaryLabel}
            onClick={() => {
              setCurrentTab(primaryLabel)
              setCurrentData(primaryData)
            }}
          >
            {primaryLabel}
          </PrimaryLabel>
          <SecondaryLabel
            active={currentTab === secondaryLabel}
            onClick={() => {
              setCurrentTab(secondaryLabel)
              setCurrentData(secondaryData)
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
        loading={loading}
        content={!currentData.length ? 'Chart is not available' : loading ? 'Loading...' : ''}
        width="100%"
        height={350}
      >
        <AreaChart data={currentData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
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
