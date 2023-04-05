import { Key, useCallback, useState } from 'react'
import { PieChart, Pie, Sector, ResponsiveContainer, Legend, Cell } from 'recharts'
import { formatAmount } from 'utils/numbers'

const tempdata = [
  { name: 'USDT', value: 400 },
  { name: 'USDC', value: 300 },
  { name: 'DAI', value: 300 },
  { name: 'USDD', value: 200 },
]

const colorMap: Record<string, string> = {
  USDT: '#26A17B',
  USDC: '#2775CA',
  DAI: '#FEBE44',
  USDD: '#216C58',
}

const renderActiveShape = (props: {
  cx: any
  cy: any
  midAngle: any
  innerRadius: any
  outerRadius: any
  startAngle: any
  endAngle: any
  fill: any
  payload: any
  percent: any
  value: any
}) => {
  const RADIAN = Math.PI / 180
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill = '#FFBA93',
    payload,
    percent,
    value,
  } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={colorMap[payload.name]}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={colorMap[payload.name] ?? fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={colorMap[payload.name] ?? fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={colorMap[payload.name] ?? fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={colorMap[payload.name] ?? fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#EBEBEC">
        {formatAmount(value)} {payload.name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#6F7380">
        {`(Share ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}

export default function SinglePieChart({ data }: { data: any }) {
  console.log('data', data)
  const [activeIndex, setActiveIndex] = useState(0)
  const handleMouseEnter = useCallback(
    (_, index) => {
      setActiveIndex(index)
    },
    [setActiveIndex]
  )

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={500} height={500}>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data ?? tempdata}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={100}
          fill="#B63562"
          dataKey="value"
          onMouseEnter={handleMouseEnter}
        >
          {data.map((item: { name: string | number; value: any }, index: Key | null | undefined) => (
            <Cell key={index} fill={colorMap[item.name]} stroke="none" />
          ))}
        </Pie>
        <Legend
          payload={data.map((item: { name: string | number; value: any }) => ({
            id: item.name,
            value: `${item.name}`,
            color: colorMap[item.name],
          }))}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
