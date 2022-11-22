import { Token } from '@sushiswap/core-sdk'
import {
  BDEI_TOKEN,
  DEI_BDEI_LP_TOKEN,
  DEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  VDEUS_TOKEN,
} from 'constants/tokens'
import { MasterChefV2, MasterChefV3, StablePool_DEI_bDEI, StablePool_DEUS_vDEUS, vDeusMasterChefV2 } from './addresses'
import { SupportedChainId } from './chains'

const lpToken_1Year = new Token(
  SupportedChainId.FANTOM,
  '0xCf18eCa0EaC101eb47828BFd460D1922000213db',
  18,
  'vDEUS NFT',
  'vDEUS NFT'
)

const lpToken_6Months = new Token(
  SupportedChainId.FANTOM,
  '0x65875f75d5CDEf890ea97ADC43E216D3f0c2b2D8',
  18,
  'vDEUS NFT',
  'vDEUS NFT'
)

const lpToken_3Months = new Token(
  SupportedChainId.FANTOM,
  '0x24651a470D08009832d62d702d1387962A2E5d60',
  18,
  'vDEUS NFT',
  'vDEUS NFT'
)

export type StakingType = {
  id: number
  name: string
  tokens: Token[]
  lpToken: Token
  rewardTokens: Token[]
  swapFlashLoan?: string
  masterChef: string
  pid: number
  active: boolean
}

export const Stakings: StakingType[] = [
  {
    id: 0,
    name: 'DEI-bDEI',
    tokens: [DEI_TOKEN, BDEI_TOKEN],
    lpToken: DEI_BDEI_LP_TOKEN,
    rewardTokens: [DEUS_TOKEN],
    swapFlashLoan: StablePool_DEI_bDEI[SupportedChainId.FANTOM],
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    pid: 1,
    active: true,
  },
  {
    id: 1,
    name: 'bDEI',
    tokens: [BDEI_TOKEN],
    lpToken: BDEI_TOKEN,
    rewardTokens: [DEUS_TOKEN],
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
  },
  {
    id: 2,
    name: 'DEUS-vDEUS',
    tokens: [DEUS_TOKEN, VDEUS_TOKEN],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    rewardTokens: [VDEUS_TOKEN],
    swapFlashLoan: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
  },
  {
    id: 3,
    name: 'vDEUS (ERC20)',
    tokens: [VDEUS_TOKEN],
    lpToken: VDEUS_TOKEN,
    rewardTokens: [DEUS_TOKEN],
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
  },
  {
    id: 4,
    name: 'vDEUS (3 Months)',
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_3Months,
    rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
  },
  {
    id: 5,
    name: 'vDEUS (6 Months)',
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_6Months,
    rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 1,
    active: true,
  },
  {
    id: 6,
    name: 'vDEUS (1 Year)',
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_1Year,
    rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
  },
]
