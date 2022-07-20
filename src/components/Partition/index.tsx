import styled from 'styled-components'

export const HorPartition = styled.div<{
  color?: string
}>`
  width: 100%;
  height: 0px;
  border-bottom: 1px solid ${({ theme, color }) => color ?? theme.border2};
`
