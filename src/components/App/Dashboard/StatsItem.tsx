import { Link as LinkIconLogo } from 'components/Icons'
import { ExternalLink } from 'components/Link'
import styled from 'styled-components'

const Item = styled.div`
  display: inline-block;
  padding: 0 24px;
  border-right: 1px solid ${({ theme }) => theme.border1};
  white-space: nowrap;
  width: 33%;
  min-width: 130px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:0 12px;
    width: 50%;
  `};
`

const Name = styled.div`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    white-space: break-spaces;
  `};
`

const Value = styled.div<{ isLink?: boolean }>`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.yellow4};
  margin-top: 10px;
  cursor: ${({ isLink }) => (isLink ? 'pointer' : 'auto')};
  & > * {
    margin-left: 6px;
  }
`

export default function StatsItem({ name, value, href }: { name: string; value: string; href?: string }) {
  const isLink = !!href
  return (
    <Item>
      <Name>{name}</Name>
      {isLink ? (
        <ExternalLink href={href} passHref>
          <Value isLink>
            {value}
            <LinkIconLogo />
          </Value>
        </ExternalLink>
      ) : (
        <Value>{value}</Value>
      )}
    </Item>
  )
}
