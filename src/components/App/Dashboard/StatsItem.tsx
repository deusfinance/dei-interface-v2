import { Link as LinkIconLogo } from 'components/Icons'
import { ExternalLink } from 'components/Link'
import styled from 'styled-components'

const Item = styled.div`
  display: inline-block;
  white-space: nowrap;
  width: 33%;
  min-width: 130px;
  path {
    fill: ${({ theme }) => theme.text2};
  }
  position: relative;
  &:after {
    content: '';
    position: absolute;
    display: flex;
    height: 100%;
    width: 1px;
    border-right: 1px solid ${({ theme }) => theme.border1};
    right: 24px;
    top: 0;
  }
  &:nth-child(3n):after {
    content: '';
    border-right: none;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:0 12px;
    width: 50%;
    &:nth-child(3n):after {
      content: '';
    position: absolute;
    display: flex;
    height: 100%;
    width: 1px;
    border-right: 1px solid ${({ theme }) => theme.border1};
    right: 24px;
    top: 0;
    }
    &:nth-child(2n):after {
        border-right: none;
      }
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

export default function StatsItem({
  name,
  value,
  href,
  onClick,
}: {
  name: string
  value: string
  href?: string
  onClick?: () => void
}) {
  const isLink = !!href
  return (
    <Item onClick={onClick}>
      <Name>{name}</Name>
      {isLink ? (
        <ExternalLink href={href} passHref>
          <Value isLink>
            {value}
            <LinkIconLogo />
          </Value>
        </ExternalLink>
      ) : !!onClick ? (
        <Value isLink>
          {value}
          <LinkIconLogo />
        </Value>
      ) : (
        <Value>{value}</Value>
      )}
    </Item>
  )
}
