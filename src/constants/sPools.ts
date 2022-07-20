import { Token } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'constants/chains'
import { BDEI_TOKEN, DEI_TOKEN, DEUS_TOKEN } from 'constants/tokens'

export type StablePoolType = {
  name: string
  swapFlashLoan: string
  liquidityTokens: Token[]
  lpToken: Token
  stakingPid: number
  rewardsTokens: Token[]
}

export const StablePools: StablePoolType[] = [
  {
    name: 'DEI-bDEI',
    swapFlashLoan: '0x9caC3CE5D8327aa5AF54b1b4e99785F991885Bf3',
    stakingPid: 1,
    liquidityTokens: [DEI_TOKEN, BDEI_TOKEN],
    lpToken: new Token(SupportedChainId.FANTOM, '0xdce9ec1eb454829b6fe0f54f504fef3c3c0642fc', 18, 'DB-LP', 'DB-LP'),
    rewardsTokens: [DEUS_TOKEN],
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
