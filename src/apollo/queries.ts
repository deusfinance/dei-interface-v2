import gql from 'graphql-tag'

export interface SolidlyToken {
  id: string // address
  name: string
  symbol: string
  decimals: string
}

export interface SolidlyPair {
  id: string // address
  name: string
  symbol: string
  decimals: string
  createdAt: string
  stable: boolean
  token0: SolidlyToken
  token1: SolidlyToken
}

export interface Voucher {
  amount: string
  currentTokenId: string
  totalBurned: string
  y: string
  usdcRedeemed: string
  deusRedeemable: string
  timestamp: string
}

export interface ChartData {
  timestamp: string
  value: string
}

export const VOUCHER_DETAILS = gql`
  query getVoucherDetails($currentTokenId: BigInt!) {
    redeems(where: { currentTokenId: $currentTokenId }, orderBy: timestamp, orderDirection: desc) {
      amount
      currentTokenId
      totalBurned
      y
      usdcRedeemed
      deusRedeemable
      timestamp
    }
  }
`

export const ALL_VOUCHERS = gql`
  query getAllVoucherDetails($ids: [BigInt!]!) {
    redeems(first: 1000, where: { currentTokenId_in: $ids }, orderBy: timestamp, orderDirection: asc) {
      amount
      currentTokenId
      totalBurned
      y
      usdcRedeemed
      deusRedeemable
      timestamp
    }
  }
`

export const SOLIDLY_PAIRS = gql`
  query getSolidlyPairs {
    pairs(first: 1000, orderBy: createdAt, orderDirection: desc) {
      id
      name
      symbol
      decimals
      createdAt
      stable
      token0 {
        id
        name
        symbol
        decimals
      }
      token1 {
        id
        name
        symbol
        decimals
      }
    }
  }
`

export const VEDEUS_SUPPLY = gql`
  query getSupply($skip: Int!, $timestamp: Int!) {
    veDEUSSupplies(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      value
    }
  }
`

export const VEDEUS_LOCKED_SUPPLY = gql`
  query getLockedSupply($skip: Int!, $timestamp: Int!) {
    totalLockeds(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      value
    }
  }
`

export const DEI_REDEMPTION_RATIOS = gql`
  query getDeiRedemptionRatio($skip: Int!, $timestamp: Int!) {
    redeemRatios(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      value
    }
  }
`

export const DEI_RESERVES_BALANCE = gql`
  query getDeiReservesBalance($skip: Int!, $timestamp: Int!) {
    deipollUSDCBalances(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      value
    }
  }
`

export const DEI_SUPPLY = gql`
  query getDeiSupply($skip: Int!, $timestamp: Int!) {
    deisupplies(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      value
    }
  }
`

export const DEUS_SUPPLY = gql`
  query getDeusSupply($skip: Int!, $timestamp: Int!) {
    deussupplies(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      value
    }
  }
`

export const SUBGRAPH_HEALTH = gql`
  query health($subgraphName: String!) {
    indexingStatusForCurrentVersion(subgraphName: $subgraphName) {
      synced
      health
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`
