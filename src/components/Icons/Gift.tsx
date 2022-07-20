import styled from 'styled-components'
import { Gift as GiftIcon } from 'react-feather'

const Icon = styled(GiftIcon)<{
  size?: string
  [x: string]: any
}>`
  stroke-width: 1;
  color: ${({ theme }) => theme.text1};
  &:hover {
    cursor: pointer;
  }
`

export default function Gift({ size, ...rest }: { size?: number; [x: string]: any }) {
  return <Icon size={size ?? 10} {...rest} />
}
