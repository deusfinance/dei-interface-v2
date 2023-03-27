import { Info, Link as LinkIconLogo } from 'components/Icons'
import { ExternalLink } from 'components/Link'
import { ToolTip } from 'components/ToolTip'
import styled from 'styled-components'

const Item = styled.div`
  display: inline-block;
  white-space: nowrap;
  width: 33%;
  min-width: 180px;
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
    border-right: 1px solid ${({ theme }) => theme.border2};
    right: 24px;
    top: 0;
  }
  &:last-child:after {
    content: '';
    border-right: none !important;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
  min-width: 130px;
    padding:0 12px;
    width: 30%;
    &:nth-child(3n){
      border-right:none !important;
    }
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  &:nth-child(3n){
    border-right: none !important;
    &:after {
    content: '';
    border-right: none !important
  }
  }
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    &:after{border-right:none;}
  `}
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
  color: ${({ theme }) => theme.text2} !important;
`

export default function StatsItem({
  name,
  value,
  href,
  onClick,
  hasToolTip,
  toolTipInfo,
}: {
  name: string
  value: string
  href?: string
  onClick?: () => void
  hasToolTip?: boolean
  toolTipInfo?: string
}) {
  const isLink = !!href
  return (
    <Item onClick={onClick}>
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
        <Value data-for="stat-id" data-tip={hasToolTip ? toolTipInfo : null}>
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
