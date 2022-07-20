import { SupportedChainId } from 'constants/chains'
import { Token } from '@sushiswap/core-sdk'
import { USDC_ADDRESS, DEUS_ADDRESS, DEI_ADDRESS, BDEI_ADDRESS } from './addresses'

export const DEI_TOKEN = new Token(SupportedChainId.FANTOM, DEI_ADDRESS[SupportedChainId.FANTOM], 18, 'DEI', 'DEI')

export const DEIv2_TOKEN = new Token(
  SupportedChainId.FANTOM,
  DEI_ADDRESS[SupportedChainId.FANTOM],
  18,
  'DEIv2',
  'DEIv2'
)

export const USDC_TOKEN = new Token(SupportedChainId.FANTOM, USDC_ADDRESS[SupportedChainId.FANTOM], 6, 'USDC', 'USDC')

export const DEUS_TOKEN = new Token(SupportedChainId.FANTOM, DEUS_ADDRESS[SupportedChainId.FANTOM], 18, 'DEUS', 'DEUS')

export const BDEI_TOKEN = new Token(SupportedChainId.FANTOM, BDEI_ADDRESS[SupportedChainId.FANTOM], 18, 'bDEI', 'bDEI')

export const DEI_BDEI_LP_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xdce9ec1eb454829b6fe0f54f504fef3c3c0642fc',
  18,
  'DB-LP',
  'DB-LP'
)
