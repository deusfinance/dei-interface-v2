import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { isMobile } from 'react-device-detect'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'

const Wrapper = styled(RowCenter)<{ DeusActive?: boolean; DeiActive?: boolean; disabled?: boolean }>`
  width: 100%;
  background: ${({ theme, DeusActive }) => DeusActive && theme.deusColor};
  background: ${({ theme, DeiActive }) => DeiActive && theme.deiColor};
  background: ${({ theme, disabled }) => !disabled && theme.bg3};
  padding: 1px;
  height: 100%;
`

const ItemWrap = styled(RowCenter)<{ active: boolean }>`
  align-items: center;
  background: ${({ theme, active }) => (active ? theme.bg4 : theme.bg2)};
  width: 100%;
  height: 100%;
  white-space: nowrap;
`

const Name = styled.div<{ active: boolean }>`
  margin-left: 12px;
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text4)};
`

export default function ItemBox({
  token,
  active,
  onTokenSelect,
}: {
  token: Token
  active: boolean
  onTokenSelect: (token: Token) => void
}) {
  const logo = useCurrencyLogo(token?.address)

  const getImageSize = () => {
    return isMobile ? 24 : 28
  }

  return (
    <Wrapper
      DeusActive={token.name?.includes('DEUS')}
      DeiActive={token.name?.includes('DEI')}
      disabled={active}
      onClick={() => onTokenSelect(token)}
    >
      <ItemWrap active={active}>
        <ImageWithFallback
          src={logo}
          width={getImageSize()}
          height={getImageSize()}
          alt={`${token?.symbol} Logo`}
          round
        />
        <Name active={active}>{token.name}</Name>
      </ItemWrap>
    </Wrapper>
  )
}
