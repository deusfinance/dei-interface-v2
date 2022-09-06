import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from './chains'
import { Tokens } from './tokens'

interface TokenMap {
  [chainId: number]: Array<Token[]>
}

export interface IBridgeToken {
  tokenId: number
  sourceChains: SupportedChainId[]
  destinationChains: SupportedChainId[]
}

/* =====================================
                  MINT
===================================== */
export const MINT__INPUTS: TokenMap = {
  [SupportedChainId.MAINNET]: [
    [Tokens.USDC[SupportedChainId.MAINNET], Tokens.DEUS[SupportedChainId.MAINNET]],
    [Tokens.USDC[SupportedChainId.MAINNET]],
    // [Tokens.NATIVE[SupportedChainId.MAINNET]],
    // [Tokens.DAI[SupportedChainId.MAINNET]],
    // [Tokens.WBTC[SupportedChainId.MAINNET]],
  ],
  [SupportedChainId.POLYGON]: [
    [Tokens.USDC[SupportedChainId.POLYGON], Tokens.DEUS[SupportedChainId.POLYGON]],
    [Tokens.USDC[SupportedChainId.POLYGON]],
    // [Tokens.NATIVE[SupportedChainId.POLYGON]],
    // [Tokens.WETH[SupportedChainId.POLYGON]],
  ],
  [SupportedChainId.FANTOM]: [
    [Tokens.USDC[SupportedChainId.FANTOM], Tokens.DEUS[SupportedChainId.FANTOM]],
    [Tokens.USDC[SupportedChainId.FANTOM]],
    // [Tokens.NATIVE[SupportedChainId.FANTOM]],
    // [Tokens.WETH[SupportedChainId.FANTOM]],
  ],
}

export const MINT__OUTPUTS: TokenMap = {
  [SupportedChainId.MAINNET]: [[Tokens['DEI'][SupportedChainId.MAINNET]]],
  [SupportedChainId.POLYGON]: [[Tokens['DEI'][SupportedChainId.POLYGON]]],
  [SupportedChainId.FANTOM]: [[Tokens['DEI'][SupportedChainId.FANTOM]]],
}

/* =====================================
                  REDEEM
===================================== */
export const REDEEM__INPUTS: TokenMap = {
  [SupportedChainId.MAINNET]: [[Tokens['DEI'][SupportedChainId.MAINNET]]],
  [SupportedChainId.POLYGON]: [[Tokens['DEI'][SupportedChainId.POLYGON]]],
  [SupportedChainId.FANTOM]: [[Tokens['DEI'][SupportedChainId.FANTOM]]],
}
export const REDEEM__OUTPUTS: TokenMap = {
  [SupportedChainId.MAINNET]: [[Tokens.USDC[SupportedChainId.MAINNET], Tokens.DEUS[SupportedChainId.MAINNET]]],
  [SupportedChainId.POLYGON]: [[Tokens.USDC[SupportedChainId.POLYGON], Tokens.DEUS[SupportedChainId.POLYGON]]],
  [SupportedChainId.FANTOM]: [[Tokens.USDC[SupportedChainId.FANTOM], Tokens.DEUS[SupportedChainId.FANTOM]]],
}

/* =====================================
                  BRIDGE
===================================== */
export const TokenID: { [id: string]: string } = {
  '0': 'DEI',
  '1': 'DEUS',
}
// export enum TokenID {
//   DEI = 0,
//   DEUS = 1,
// }

export const BRIDGE__TOKENS: { [symbol: string]: IBridgeToken } = {
  ['DEI']: {
    tokenId: 0,
    sourceChains: [SupportedChainId.POLYGON, SupportedChainId.FANTOM, SupportedChainId.MAINNET],
    destinationChains: [SupportedChainId.POLYGON, SupportedChainId.FANTOM, SupportedChainId.MAINNET],
  },
  ['DEUS']: {
    tokenId: 1,
    sourceChains: [SupportedChainId.POLYGON, SupportedChainId.FANTOM, SupportedChainId.MAINNET],
    destinationChains: [SupportedChainId.POLYGON, SupportedChainId.FANTOM, SupportedChainId.MAINNET],
  },
}
