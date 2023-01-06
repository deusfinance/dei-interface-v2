import { Token } from '@sushiswap/core-sdk'
import {
  BDEI_TOKEN,
  DEI_BDEI_LP_TOKEN,
  DEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  USDC_TOKEN,
  VDEUS_TOKEN,
  WFTM_TOKEN,
} from 'constants/tokens'
import { useGetApy, useGetDeusApy, useNFTGetApy, useV2GetApy } from 'hooks/useStakingInfo'
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

export enum StakingVersion {
  V1,
  V2,
  NFT,
  EXTERNAL,
}

export type ProvideTokens = {
  id: number
  title: string
  link: string
}

export type StakingType = {
  id: number
  name: string
  rewardTokens: Token[]
  token?: Token
  provideLink?: string
  aprHook: (h: StakingType) => number
  secondaryAprHook: (liqPool?: any, stakingPool?: any) => number
  masterChef: string
  pid: number
  active: boolean
  hasSecondaryApy?: boolean
  version: StakingVersion
}

export type ExternalStakingType = {
  id: number
  name: string
  rewardTokens: Token[]
  provideLink: string
  active: boolean
  version: StakingVersion
}

export type LiquidityType = {
  id: number
  tokens: Token[]
  provideLinks?: ProvideTokens[]
  lpToken: Token
  contract?: string
  priceToken?: Token
}

export const LiquidityPool: LiquidityType[] = [
  {
    id: 0,
    tokens: [DEI_TOKEN, BDEI_TOKEN],
    provideLinks: [
      {
        id: 0,
        title: 'Buy on Firebird',
        link: 'https://app.firebird.finance/swap?outputCurrency=0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0&net=250',
      },
      { id: 1, title: 'Go to Swap Page', link: '/swap' },
    ],
    lpToken: DEI_BDEI_LP_TOKEN,
    contract: StablePool_DEI_bDEI[SupportedChainId.FANTOM],
    priceToken: DEI_TOKEN,
  },
  {
    id: 1,
    tokens: [BDEI_TOKEN], // TODO: remove
    lpToken: BDEI_TOKEN,
  },
  {
    id: 2,
    tokens: [VDEUS_TOKEN, DEUS_TOKEN],
    provideLinks: [
      {
        id: 0,
        title: 'Buy on Firebird',
        link: 'https://app.firebird.finance/swap?outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44&net=250',
      },
      { id: 1, title: 'Go to Swap Page', link: '/swap' },
    ],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    contract: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
    priceToken: DEUS_TOKEN,
  },
  {
    id: 3,
    tokens: [VDEUS_TOKEN], // TODO: remove
    lpToken: VDEUS_TOKEN,
  },
  {
    id: 4,
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_3Months,
  },
  {
    id: 5,
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_6Months,
  },
  {
    id: 6,
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_1Year,
  },
  {
    id: 7,
    tokens: [USDC_TOKEN, DEI_TOKEN],
    lpToken: DEI_TOKEN,
  },
  {
    id: 8,
    tokens: [USDC_TOKEN, DEI_TOKEN],
    lpToken: DEI_TOKEN,
  },
  {
    id: 9,
    tokens: [WFTM_TOKEN, DEUS_TOKEN],
    lpToken: DEI_TOKEN,
  },
]

export const Stakings: StakingType[] = [
  {
    id: 0,
    name: 'DEI-bDEI',
    rewardTokens: [DEUS_TOKEN],
    token: DEI_BDEI_LP_TOKEN,
    provideLink: '/deibonds',
    aprHook: useGetApy,
    secondaryAprHook: () => 0,
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
    secondaryAprHook: () => 0,
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    version: StakingVersion.V1,
  },
  {
    id: 2,
    name: 'DEUS-vDEUS',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    token: DEUS_VDEUS_LP_TOKEN,
    provideLink: '/vdeus/new',
    aprHook: useV2GetApy,
    secondaryAprHook: useGetDeusApy,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
    hasSecondaryApy: true,
    version: StakingVersion.V2,
  },
  {
    id: 3,
    name: 'vDEUS (ERC20)',
    rewardTokens: [DEUS_TOKEN],
    provideLink: '/vdeus/new',
    aprHook: useV2GetApy,
    secondaryAprHook: () => 0,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    version: StakingVersion.V2,
  },
  {
    id: 4,
    name: 'vDEUS (3 Months)',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    aprHook: useNFTGetApy,
    secondaryAprHook: () => 0,
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    version: StakingVersion.NFT,
  },
  {
    id: 5,
    name: 'vDEUS (6 Months)',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    aprHook: useNFTGetApy,
    secondaryAprHook: () => 0,
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 1,
    active: true,
    version: StakingVersion.NFT,
  },
  {
    id: 6,
    name: 'vDEUS (1 Year)',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    aprHook: useNFTGetApy,
    secondaryAprHook: () => 0,
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
    version: StakingVersion.NFT,
  },
]

export const ExternalStakings: ExternalStakingType[] = [
  {
    id: 7,
    name: 'Another DEI, another dollar',
    rewardTokens: [DEUS_TOKEN],
    provideLink: 'https://beets.fi/pool/0x4e415957aa4fd703ad701e43ee5335d1d7891d8300020000000000000000053b',
    active: true,
    version: StakingVersion.EXTERNAL,
  },
  {
    id: 8,
    name: 'USDC-DEI',
    rewardTokens: [DEUS_TOKEN],
    provideLink:
      'https://spooky.fi/#/add/0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    active: true,
    version: StakingVersion.EXTERNAL,
  },
  {
    id: 9,
    name: 'FTM-DEUS',
    rewardTokens: [DEUS_TOKEN],
    provideLink: 'https://spooky.fi/#/add/0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44/FTM',
    active: true,
    version: StakingVersion.EXTERNAL,
  },
]
