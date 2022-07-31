import { Link } from 'components/Icons'
import styled from 'styled-components'

const Item = styled.div<{ rightBorder?: boolean }>`
  display: inline-block;
  padding-left: 24px;
  padding-right: 24px;
  border-right: 1px solid ${({ theme }) => theme.border1};
  white-space: nowrap;
  width: 33%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 12px;
  padding-right:12px;
  flex-wrap: wrap;
  width: 50%;

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

export default function StatsItem({ name, value, linkIcon }: { name: string; value: string; linkIcon?: boolean }) {
  return (
    <Item>
      <Name>{name}</Name>
      <Value>
        {value} {linkIcon ? <Link /> : ''}
      </Value>
    </Item>
  )
}
