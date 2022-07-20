import styled from 'styled-components'
import { Activity } from 'react-feather'

export const Network = styled(Activity)<{
  size?: string | number
}>`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: ${({ size }) => size ?? '16px'};
  height: ${({ size }) => size ?? '16px'};
`
