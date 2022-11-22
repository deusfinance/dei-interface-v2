import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'constants/chains'
import {
  BDEI_TOKEN,
  DEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  VDEUS_TOKEN,
  DEI_BDEI_LP_TOKEN,
} from 'constants/tokens'
import { StablePool_DEUS_vDEUS, StablePool_DEI_bDEI } from './addresses'

export type StablePoolType = {
  name: string
  swapFlashLoan: string
  liquidityTokens: Token[]
  lpToken: Token
  rewardsTokens: Token[]
}

export const StablePools: StablePoolType[] = [
  {
    name: 'DEI-bDEI',
    swapFlashLoan: StablePool_DEI_bDEI[SupportedChainId.FANTOM],
    liquidityTokens: [DEI_TOKEN, BDEI_TOKEN],
    lpToken: DEI_BDEI_LP_TOKEN,
    rewardsTokens: [DEUS_TOKEN],
  },
  {
    name: 'DEUS-vDEUS',
    swapFlashLoan: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
    liquidityTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    rewardsTokens: [VDEUS_TOKEN],
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
