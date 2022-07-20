import styled from 'styled-components'
import { X } from 'react-feather'

export const Close = styled(X)<{
  size?: string
  color?: string
  onClick?: () => void
}>`
  width: ${(props) => props.size ?? '15px'};
  height: ${(props) => props.size ?? '15px'};
  color: ${({ theme, color }) => color ?? theme.text1};
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`
