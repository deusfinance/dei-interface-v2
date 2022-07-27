import { ProxyPath } from 'utils/address'
import { Collateral } from './addresses'
import { SupportedChainId } from './chains'
import { Tokens } from './tokens'

export const MINT__PATHS: ProxyPath = {
  [SupportedChainId.MAINNET]: {
    DEUS: [
      Tokens.DEUS[SupportedChainId.MAINNET]['address'],
      Tokens.DEI[SupportedChainId.MAINNET]['address'],
      Collateral[SupportedChainId.MAINNET],
    ],
    ETH: [Tokens.WNATIVE[SupportedChainId.MAINNET]['address'], Collateral[SupportedChainId.MAINNET]],
    USDC: [Collateral[SupportedChainId.MAINNET]],
    DAI: [Tokens.DAI[SupportedChainId.MAINNET]['address'], Collateral[SupportedChainId.MAINNET]],
    DEI: [Tokens.DEI[SupportedChainId.MAINNET]['address'], Collateral[SupportedChainId.MAINNET]],
    WBTC: [
      Tokens.WBTC[SupportedChainId.MAINNET]['address'],
      Tokens.WETH[SupportedChainId.MAINNET]['address'],
      Collateral[SupportedChainId.MAINNET],
    ],
  },

  [SupportedChainId.POLYGON]: {
    DEUS: [
      Tokens.DEUS[SupportedChainId.POLYGON]['address'],
      Tokens.DEI[SupportedChainId.POLYGON]['address'],
      Collateral[SupportedChainId.POLYGON],
    ],
    DEI: [Tokens.DEI[SupportedChainId.POLYGON]['address'], Collateral[SupportedChainId.POLYGON]],
    WETH: [Tokens.WETH[SupportedChainId.POLYGON]['address'], Collateral[SupportedChainId.POLYGON]],
    USDC: [Collateral[SupportedChainId.POLYGON]],
    MATIC: [Tokens.WNATIVE[SupportedChainId.POLYGON]['address'], Collateral[SupportedChainId.POLYGON]],
  },

  [SupportedChainId.FANTOM]: {
    DEUS: [Tokens.DEUS[SupportedChainId.FANTOM]['address'], Collateral[SupportedChainId.FANTOM]],
    DEI: [Tokens.DEI[SupportedChainId.FANTOM]['address'], Collateral[SupportedChainId.FANTOM]],
    WETH: [Tokens.WETH[SupportedChainId.FANTOM]['address'], Collateral[SupportedChainId.FANTOM]],
    USDC: [Collateral[SupportedChainId.FANTOM]],
    FTM: [Tokens.WNATIVE[SupportedChainId.FANTOM]['address'], Collateral[SupportedChainId.FANTOM]],
  },
}
