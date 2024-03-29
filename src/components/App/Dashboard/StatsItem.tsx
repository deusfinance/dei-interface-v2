import { Info, Link as LinkIconLogo } from 'components/Icons'
import { ExternalLink } from 'components/Link'
import { ToolTip } from 'components/ToolTip'
import styled from 'styled-components'

const Item = styled.div<{ hasOnClick?: any }>`
  display: inline-block;
  padding: 0 24px;
  border-right: 1px solid ${({ theme }) => theme.border1};
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
    right: 24px;
    top: 0;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:0 12px;
    width: 50%;
  `};

  ${({ hasOnClick }) =>
    hasOnClick &&
    `
    &:hover {
      cursor: pointer;
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
  display: flex;
  font-weight: 500;
  font-size: 14px;
  width: fit-content;
  color: ${({ theme }) => theme.yellow4};
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
  color: ${({ theme }) => theme.text1} !important;
`

export default function StatsItem({
  name,
  value,
  href,
  onClick,
  hasOnClick,
  hasToolTip,
  toolTipInfo,
}: {
  name: string
  value: string
  href?: string
  onClick?: () => void
  hasOnClick?: boolean
  hasToolTip?: boolean
  toolTipInfo?: string
}) {
  const isLink = !!href
  return (
    <Item onClick={onClick} hasOnClick={hasOnClick}>
      <Name>{name}</Name>
      {isLink ? (
        <ExternalLink href={href} passHref>
          <Value isLink>
            {value}
            <LinkIconLogo style={{ marginTop: '6px' }} />
          </Value>
        </ExternalLink>
      ) : !!onClick ? (
        <Value isLink>
          {value}
          <LinkIconLogo style={{ marginTop: '6px' }} />
        </Value>
      ) : (
        <Value data-for="id" data-tip={hasToolTip ? toolTipInfo : null}>
          {value}
          {hasToolTip && (
            <span style={{ marginTop: '1px' }}>
              <InfoIcon size={12} />
              <CustomTooltip id="id" />
            </span>
          )}
        </Value>
      )}
    </Item>
  )
}
