import { Search as SearchIcon } from 'react-feather'

import { useTheme } from 'styled-components'
import { IconWrapper } from './index'

export default function Search({ size }: { size?: number }) {
  const theme = useTheme()
  return (
    <IconWrapper stroke={theme.text2}>
      <SearchIcon opacity={0.6} size={size ?? 16} />
    </IconWrapper>
  )
}
