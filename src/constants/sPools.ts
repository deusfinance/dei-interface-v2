import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'constants/chains'
import {
  BDEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  XDEUS_TOKEN,
  LegacyDEI_TOKEN,
  LEGACY_DEI_BDEI_LP_TOKEN,
} from 'constants/tokens'
import { StablePool_DEUS_vDEUS, StablePool_legacyDEI_bDEI } from './addresses'

export type StablePoolType = {
  id: number
  name: string
  swapFlashLoan: string
  liquidityTokens: Token[]
  lpToken: Token
  rewardsTokens: Token[]
}

export const StablePools: StablePoolType[] = [
  {
    id: 0,
    name: 'legacyDEI-bDEI',
    swapFlashLoan: StablePool_legacyDEI_bDEI[SupportedChainId.FANTOM],
    liquidityTokens: [LegacyDEI_TOKEN, BDEI_TOKEN],
    lpToken: LEGACY_DEI_BDEI_LP_TOKEN,
    rewardsTokens: [DEUS_TOKEN],
  },
  {
    id: 2, // to make sure LiquidityPool and StablePools have same ids
    name: 'DEUS-xDEUS',
    swapFlashLoan: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
    liquidityTokens: [XDEUS_TOKEN, DEUS_TOKEN],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    rewardsTokens: [XDEUS_TOKEN],
  },
]

export function getTokenIndex(symbolOrAddress: string, pool: StablePoolType): number | null {
  const { liquidityTokens: tokens } = pool
  for (let index = 0; index < tokens.length; index++) {
    if (
      symbolOrAddress.toLowerCase() == tokens[index].address.toLowerCase() ||
      symbolOrAddress.toLowerCase() == tokens[index].symbol?.toLowerCase()
    )
      return index
  }
  return null
}
