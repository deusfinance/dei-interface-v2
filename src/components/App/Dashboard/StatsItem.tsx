import { Info, Link as LinkIconLogo } from 'components/Icons'
import { ExternalLink } from 'components/Link'
import { ToolTip } from 'components/ToolTip'
import styled from 'styled-components'

const Item = styled.div`
  margin-top: 20px;
  display: inline-block;
  white-space: nowrap;
  width: 33%;
  min-width: 200px;
  row-gap: 32px;
  column-gap: 32px;
  path {
    fill: ${({ theme }) => theme.text2};
  }
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  min-width: 130px;
    padding:0 12px;
    width: 30%;
  `};
`

const Name = styled.div`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    white-space: break-spaces;
  `};
`

const Value = styled.div<{ isLink?: boolean; isDeus?: boolean }>`
  font-family: 'IBM Plex Mono';
  display: flex;
  font-weight: 500;
  font-size: 14px;
  width: fit-content;
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
  cursor: ${({ isLink }) => (isLink ? 'pointer' : 'auto')};
  & > * {
    margin-left: 6px;
  }
`

const CustomTooltip = styled(ToolTip)`
  max-width: 600px !important;
  font-size: 0.8rem !important;
`

const InfoIcon = styled(Info)`
  margin-top: 1px;
  color: ${({ theme }) => theme.text2} !important;
`

export default function StatsItem({
  name,
  value,
  href,
  onClick,
  hasToolTip,
  toolTipInfo,
  isDeus,
}: {
  name: string
  value: string
  href?: string
  onClick?: () => void
  hasToolTip?: boolean
  toolTipInfo?: string
  isDeus?: boolean
}) {
  const isLink = !!href
  return (
    <Item onClick={onClick}>
      <Name>{name}</Name>
      {isLink ? (
        <ExternalLink href={href} passHref>
          <Value isLink isDeus={isDeus}>
            {value}
            <LinkIconLogo style={{ marginTop: '6px' }} />
          </Value>
        </ExternalLink>
      ) : !!onClick ? (
        <Value isLink isDeus={isDeus}>
          {value}
          <LinkIconLogo style={{ marginTop: '6px' }} />
        </Value>
      ) : (
        <Value data-for="stat-id" data-tip={hasToolTip ? toolTipInfo : null} isDeus={isDeus}>
          {value}
          {hasToolTip && (
            <span style={{ marginTop: '1px' }}>
              <InfoIcon size={12} />
              <CustomTooltip id="stat-id" />
            </span>
          )}
        </Value>
      )}
    </Item>
  )
}
