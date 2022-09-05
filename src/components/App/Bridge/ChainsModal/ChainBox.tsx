import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import FTM_LOGO from '/public/static/images/tokens/ftm.svg'
import POLYGON_LOGO from '/public/static/images/tokens/polygon.svg'
import MAINNET_LOGO from '/public/static/images/networks/mainnet.svg'

import ImageWithFallback from 'components/ImageWithFallback'
import { Row, RowCenter } from 'components/Row'
import { SupportedChainId } from 'constants/chains'

const Wrapper = styled(Row)<{ disabled?: boolean }>`
  background: ${({ theme }) => theme.bg2};
  opacity: ${({ disabled }) => (disabled ? '0.3' : '1')};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 64px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};
  cursor: pointer;

  &:hover {
    background: ${({ theme, disabled }) => (disabled ? theme.bg2 : theme.bg4)};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `}
`

const RightWrapper = styled(Row)<{ FantomActive?: boolean; PolygonActive?: boolean; EthereumActive?: boolean }>`
  width: 100%;
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.border1};
  padding: 18px;
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme, FantomActive }) => FantomActive && theme.fantomColor};
  color: ${({ theme, PolygonActive }) => PolygonActive && theme.polygonColor};
  color: ${({ theme, EthereumActive }) => EthereumActive && theme.ethereumColor};
`

const LogoWrapper = styled(RowCenter)`
  height: 100%;
  width: 80px;
`

const getImageSize = () => {
  return isMobile ? 28 : 32
}

export default function ChainBox({
  chainId,
  handleClick,
  disabled,
}: {
  chainId: SupportedChainId
  handleClick: (chainId: SupportedChainId) => void
  disabled?: boolean
}) {
  const chainsLogo: { [chainId: number]: any } = {
    [SupportedChainId.FANTOM]: FTM_LOGO,
    [SupportedChainId.POLYGON]: POLYGON_LOGO,
    [SupportedChainId.MAINNET]: MAINNET_LOGO,
  }

  return (
    <Wrapper onClick={() => handleClick(chainId)} disabled={disabled}>
      <LogoWrapper>
        <ImageWithFallback
          src={chainsLogo[chainId]}
          width={getImageSize()}
          height={getImageSize()}
          alt={`chain Logo`}
          round
        />
      </LogoWrapper>

      <RightWrapper
        FantomActive={chainId === SupportedChainId.FANTOM}
        PolygonActive={chainId === SupportedChainId.POLYGON}
        EthereumActive={chainId === SupportedChainId.MAINNET}
      >{`${SupportedChainId[chainId]}`}</RightWrapper>
    </Wrapper>
  )
}
