import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'

export const ToolTip = styled(ReactTooltip).attrs({
  place: 'right',
  type: 'info',
  effect: 'solid',
  multiline: true,
})`
  color: ${({ theme }) => theme.text1} !important;
  background: ${({ theme }) => theme.primary1} !important;
  opacity: 1 !important;
  padding: 3px 7px !important;
  font-size: 0.6rem !important;
  max-width: 180px !important;
`
