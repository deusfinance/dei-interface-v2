import { Link } from 'components/Icons'
import styled from 'styled-components'

const Item = styled.div<{ rightBorder?: boolean }>`
  display: inline-block;
  padding: 0 24px;
  border-right: ${({ theme, rightBorder }) => (rightBorder ? `1px solid ${theme.border1}` : 'unset')};
  overflow-x: auto;
  white-space: nowrap;
  width: 33%;
  -webkit-overflow-scrolling: touch;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: stretch;
  `};
`

const Name = styled.div`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  white-space: nowrap;
`

const Value = styled.div`
  font-family: 'IBM Plex Mono';
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.yellow4};
  margin-top: 10px;
`

export default function StatsItem({
  name,
  value,
  rightBorder,
}: {
  name: string
  value: string
  rightBorder?: boolean
}) {
  return (
    <Item rightBorder={rightBorder}>
      <Name>{name}</Name>
      <Value>
        {value} <Link />
      </Value>
    </Item>
  )
}
