import { Token } from '@sushiswap/core-sdk'
import {
  BDEI_TOKEN,
  DEI_BDEI_LP_TOKEN,
  DEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  VDEUS_TOKEN,
} from 'constants/tokens'
import { useGetApy, useV2GetApy } from 'hooks/useStakingInfo'
import { MasterChefV2, MasterChefV3, StablePool_DEI_bDEI, StablePool_DEUS_vDEUS } from './addresses'
import { SupportedChainId } from './chains'

// const lpToken_1Year = new Token(
//   SupportedChainId.FANTOM,
//   '0xCf18eCa0EaC101eb47828BFd460D1922000213db',
//   18,
//   'vDEUS NFT',
//   'vDEUS NFT'
// )

// const lpToken_6Months = new Token(
//   SupportedChainId.FANTOM,
//   '0x65875f75d5CDEf890ea97ADC43E216D3f0c2b2D8',
//   18,
//   'vDEUS NFT',
//   'vDEUS NFT'
// )

// const lpToken_3Months = new Token(
//   SupportedChainId.FANTOM,
//   '0x24651a470D08009832d62d702d1387962A2E5d60',
//   18,
//   'vDEUS NFT',
//   'vDEUS NFT'
// )

export enum StakingVersion {
  V1,
  V2,
  NFT,
}

export type StakingType = {
  id: number
  name: string
  rewardTokens: Token[]
  provideLink?: string
  aprHook: (h: StakingType) => number
  masterChef: string
  pid: number
  active: boolean
  version: StakingVersion
}

export type LiquidityType = {
  id: number
  tokens: Token[]
  lpToken: Token
  contract?: string
}

export const LiquidityPool: LiquidityType[] = [
  {
    id: 0,
    tokens: [DEI_TOKEN, BDEI_TOKEN],
    lpToken: DEI_BDEI_LP_TOKEN,
    contract: StablePool_DEI_bDEI[SupportedChainId.FANTOM],
  },
  {
    id: 1,
    tokens: [BDEI_TOKEN], // TODO: remove
    lpToken: BDEI_TOKEN,
  },
  {
    id: 2,
    tokens: [DEUS_TOKEN, VDEUS_TOKEN],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    contract: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
  },
  {
    id: 3,
    tokens: [VDEUS_TOKEN], // TODO: remove
    lpToken: VDEUS_TOKEN,
  },
]

export const Stakings: StakingType[] = [
  {
    id: 0,
    name: 'DEI-bDEI',
    rewardTokens: [DEUS_TOKEN],
    provideLink: '/deibonds',
    aprHook: useGetApy,
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    pid: 1,
    active: true,
    version: StakingVersion.V1,
  },
  {
    id: 1,
    name: 'bDEI',
    rewardTokens: [DEUS_TOKEN],
    provideLink: '/deibonds',
    aprHook: useGetApy,
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    pid: 0,
    active: false,
    version: StakingVersion.V1,
  },
  {
    id: 2,
    name: 'DEUS-vDEUS',
    rewardTokens: [VDEUS_TOKEN],
    provideLink: '/vdeus/new',
    aprHook: useV2GetApy,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
    version: StakingVersion.V2,
  },
  {
    id: 3,
    name: 'vDEUS (ERC20)',
    rewardTokens: [DEUS_TOKEN],
    provideLink: '/vdeus/new',
    aprHook: useV2GetApy,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    version: StakingVersion.V2,
  },
  // {
  //   id: 4,
  //   name: 'vDEUS (3 Months)',
  //   tokens: [VDEUS_TOKEN],
  //   lpToken: lpToken_3Months,
  //   rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
  //   masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
  //   pid: 0,
  //   active: false,
  // },
  // {
  //   id: 5,
  //   name: 'vDEUS (6 Months)',
  //   tokens: [VDEUS_TOKEN],
  //   lpToken: lpToken_6Months,
  //   rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
  //   masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
  //   pid: 1,
  //   active: false,
  // },
  // {
  //   id: 6,
  //   name: 'vDEUS (1 Year)',
  //   tokens: [VDEUS_TOKEN],
  //   lpToken: lpToken_1Year,
  //   rewardTokens: [DEUS_TOKEN, VDEUS_TOKEN],
  //   masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
  //   pid: 2,
  //   active: false,
  // },
]
