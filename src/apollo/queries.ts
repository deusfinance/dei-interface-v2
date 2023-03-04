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

export const ECOSYSTEM_STATS = gql`
  query getAllStats($skip: Int!, $timestamp: Int!) {
    hourlyDEISupplySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      deiSupply
      collaterizationRatio
      totalUSDCReserves
    }

    dailyDEISupplySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      deiSupply
      collaterizationRatio
      totalUSDCReserves
    }
  }
`

export const HOURLY_ECOSYSTEM_STATS = gql`
  query getAllStats($skip: Int!, $timestamp: Int!) {
    hourlyDEISupplySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      deiSupply
      collaterizationRatio
      totalUSDCReserves
    }
  }
`

export const DAILY_ECOSYSTEM_STATS = gql`
  query getAllStats($skip: Int!, $timestamp: Int!) {
    dailyDEISupplySnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      deiSupply
      collaterizationRatio
      totalUSDCReserves
    }
  }
`

export const HOURLY_DEI_PRICE_STATS = gql`
  query getHourlyStats($skip: Int!, $timestamp: Int!) {
    hourlyDeiTokenPriceSnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      deiPrice
    }
  }
`

export const DAILY_DEI_PRICE_STATS = gql`
  query getDailyStats($skip: Int!, $timestamp: Int!) {
    dailyDeiTokenPriceSnapshots(
      first: 1000
      skip: $skip
      where: { timestamp_lt: $timestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      deiPrice
    }
  }
`
