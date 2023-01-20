import { Token } from '@sushiswap/core-sdk'
import {
  BDEI_TOKEN,
  DEI_BDEI_LP_TOKEN,
  DEI_TOKEN,
  DEUS_TOKEN,
  DEUS_VDEUS_LP_TOKEN,
  SOLID_TOKEN,
  USDC_TOKEN,
  VDEUS_TOKEN,
  WFTM_TOKEN,
  XDEUS_DEUS_SOLIDLY_LP,
} from 'constants/tokens'
import { useGetBeetsApy, useGetBeetsTvl } from 'hooks/useBeetsPoolStats'
import { useSolidlyApy, useSolidlyTvl } from 'hooks/useSolidlyPoolStats'
import { useGetApy, useGetDeusApy, useGetTvl, useNFTGetApy } from 'hooks/useStakingInfo'
import { MasterChefV2, MasterChefV3, StablePool_DEI_bDEI, StablePool_DEUS_vDEUS, vDeusMasterChefV2 } from './addresses'
import { ChainInfo } from './chainInfo'
import { SupportedChainId } from './chains'
import { BUTTON_TYPE } from './misc'

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
  tvlHook: (h: StakingType) => number
  secondaryAprHook: (liqPool?: any, stakingPool?: any) => number
  masterChef: string
  pid: number
  active: boolean
  hasSecondaryApy?: boolean
  version: StakingVersion
  isSingleStaking: boolean
  chain: string
  type: BUTTON_TYPE
}

export type ExternalStakingType = {
  id: number
  name: string
  rewardTokens: Token[]
  provideLink: string
  tokens?: Token[]
  contract: string
  aprHook?: (h: ExternalStakingType) => number
  tvlHook?: (h: ExternalStakingType) => number
  active: boolean
  version: StakingVersion
  chain: string
  type: BUTTON_TYPE
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
    priceToken: DEI_TOKEN,
  },
  {
    id: 2,
    tokens: [VDEUS_TOKEN, DEUS_TOKEN],
    provideLinks: [
      { id: 0, title: 'Go to Swap Page', link: '/swap' },
      {
        id: 1,
        title: 'Buy on Firebird',
        link: 'https://app.firebird.finance/swap?outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44&net=250',
      },
    ],
    lpToken: DEUS_VDEUS_LP_TOKEN,
    contract: StablePool_DEUS_vDEUS[SupportedChainId.FANTOM],
    priceToken: DEUS_TOKEN,
  },
  {
    id: 3,
    tokens: [VDEUS_TOKEN], // TODO: remove
    lpToken: VDEUS_TOKEN,
    priceToken: DEUS_TOKEN,
  },
  {
    id: 4,
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_3Months,
    priceToken: DEUS_TOKEN,
  },
  {
    id: 5,
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_6Months,
    priceToken: DEUS_TOKEN,
  },
  {
    id: 6,
    tokens: [VDEUS_TOKEN],
    lpToken: lpToken_1Year,
    priceToken: DEUS_TOKEN,
  },
  {
    id: 7,
    tokens: [USDC_TOKEN, DEI_TOKEN],
    lpToken: DEI_TOKEN,
    priceToken: DEUS_TOKEN,
  },
  {
    id: 8,
    tokens: [USDC_TOKEN, DEI_TOKEN],
    lpToken: DEI_TOKEN,
    priceToken: DEUS_TOKEN,
  },
  {
    id: 9,
    tokens: [WFTM_TOKEN, DEUS_TOKEN],
    lpToken: DEI_TOKEN,
    priceToken: DEUS_TOKEN,
  },
]

export const Stakings: StakingType[] = [
  {
    id: 0,
    name: 'DEI-bDEI',
    rewardTokens: [DEUS_TOKEN],
    token: DEI_BDEI_LP_TOKEN,
    aprHook: useGetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    pid: 1,
    active: true,
    version: StakingVersion.V1,
    isSingleStaking: false,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.INTERNAL,
  },
  {
    id: 1,
    name: 'bDEI',
    rewardTokens: [DEUS_TOKEN],
    token: BDEI_TOKEN,
    aprHook: useGetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: MasterChefV2[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    version: StakingVersion.V1,
    isSingleStaking: true,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.INTERNAL,
  },
  {
    id: 2,
    name: 'DEUS-vDEUS',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    token: DEUS_VDEUS_LP_TOKEN,
    aprHook: useGetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
    hasSecondaryApy: true,
    version: StakingVersion.V2,
    isSingleStaking: false,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.INTERNAL,
  },
  {
    id: 3,
    name: 'vDEUS (ERC20)',
    rewardTokens: [DEUS_TOKEN],
    token: VDEUS_TOKEN,
    aprHook: useGetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: MasterChefV3[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    version: StakingVersion.V2,
    isSingleStaking: true,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.INTERNAL,
  },
  {
    id: 4,
    name: 'vDEUS (3 Months)',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    token: VDEUS_TOKEN, // TODO: should represent vDEUS NFT
    aprHook: useNFTGetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 0,
    active: true,
    version: StakingVersion.NFT,
    isSingleStaking: true,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.INTERNAL,
  },
  {
    id: 5,
    name: 'vDEUS (6 Months)',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    token: VDEUS_TOKEN, // TODO: should represent vDEUS NFT
    aprHook: useNFTGetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 1,
    active: true,
    version: StakingVersion.NFT,
    isSingleStaking: true,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.INTERNAL,
  },
  {
    id: 6,
    name: 'vDEUS (1 Year)',
    rewardTokens: [VDEUS_TOKEN, DEUS_TOKEN],
    token: VDEUS_TOKEN, // TODO: should represent vDEUS NFT
    aprHook: useNFTGetApy,
    tvlHook: useGetTvl,
    secondaryAprHook: useGetDeusApy,
    masterChef: vDeusMasterChefV2[SupportedChainId.FANTOM],
    pid: 2,
    active: true,
    version: StakingVersion.NFT,
    isSingleStaking: true,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.INTERNAL,
  },
]

export const ExternalStakings: ExternalStakingType[] = [
  {
    id: 7,
    name: 'Another DEI, another dollar',
    rewardTokens: [DEUS_TOKEN],
    tokens: [DEI_TOKEN, USDC_TOKEN],
    provideLink: 'https://beets.fi/pool/0x4e415957aa4fd703ad701e43ee5335d1d7891d8300020000000000000000053b',
    aprHook: useGetBeetsApy,
    tvlHook: useGetBeetsTvl,
    contract: '0x4e415957aa4fd703ad701e43ee5335d1d7891d8300020000000000000000053b', // poolId of the beets pool
    active: true,
    version: StakingVersion.EXTERNAL,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.BEETHOVEN,
  },
  {
    id: 8,
    name: 'USDC-DEI',
    rewardTokens: [DEUS_TOKEN],
    provideLink:
      'https://spooky.fi/#/add/0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
    aprHook: useGetBeetsApy, // dummy placeholders for now
    tvlHook: useGetBeetsTvl, // dummy placeholders for now
    contract: '',
    active: true,
    version: StakingVersion.EXTERNAL,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.SPOOKY_SWAP,
  },
  {
    id: 9,
    name: 'FTM-DEUS',
    rewardTokens: [DEUS_TOKEN],
    provideLink: 'https://spooky.fi/#/add/0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44/FTM',
    aprHook: useGetBeetsApy, // dummy placeholders for now
    tvlHook: useGetBeetsTvl, // dummy placeholders for now
    contract: '',
    active: true,
    version: StakingVersion.EXTERNAL,
    chain: ChainInfo[SupportedChainId.FANTOM].label,
    type: BUTTON_TYPE.SPOOKY_SWAP,
  },
  {
    id: 10,
    name: 'xDEUS-DEUS',
    rewardTokens: [VDEUS_TOKEN, SOLID_TOKEN],
    provideLink: 'https://solidly.com/liquidity/0x4EF3fF9dadBa30cff48133f5Dc780A28fc48693F',
    active: true,
    contract: XDEUS_DEUS_SOLIDLY_LP.address,
    aprHook: useSolidlyApy,
    tvlHook: useSolidlyTvl,
    version: StakingVersion.EXTERNAL,
    chain: ChainInfo[SupportedChainId.MAINNET].label,
    type: BUTTON_TYPE.SOLIDLY,
  },
]
