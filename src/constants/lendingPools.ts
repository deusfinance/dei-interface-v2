import { Token } from '@sushiswap/core-sdk'
import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'

export type LendingPoolType = {
  id: number
  name: string
  collaterals: Token[]
  assets: Token[]
}

export const LendingPool: LendingPoolType[] = [
  {
    id: 0,
    name: 'pool 1',
    collaterals: [DEI_TOKEN, USDC_TOKEN],
    assets: [DEUS_TOKEN, USDC_TOKEN],
  },
  {
    id: 1,
    name: 'pool 2',
    collaterals: [DEI_TOKEN, DEUS_TOKEN],
    assets: [USDC_TOKEN],
  },
]
