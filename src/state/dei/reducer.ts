import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { SupportedChainId } from 'constants/chains'
import { ORACLE_BASE_URL } from 'constants/muon'
import { makeHttpRequest } from 'utils/http'

export const DeiSupportedChains = [SupportedChainId.FANTOM, SupportedChainId.MAINNET, SupportedChainId.POLYGON]

export enum DeiStatus {
  OK = 'OK',
  LOADING = 'LOADING',
  REFRESHING = 'REFRESHING',
  ERROR = 'ERROR',
}

//TODO: add this info to state
//buyBackPaused
//buyback_fee
//recollateralizePaused
//recollat_fee

interface Scale {
  collateralRatio: number
  fee: number
  poolCeiling: number
  poolBalance: number
}

interface OracleResponse {
  collateral_price: number
  dei_price: number
  deus_price: number
}

type Prices = {
  collateral: number
  dei: number
  deus: number
}

const DEFAULT_SCALE = {
  collateralRatio: 1e6,
  fee: 1e4,
  poolCeiling: 1e6,
  poolBalance: 1e12,
}

export const Scales: { [chainId in SupportedChainId]?: Scale } = {
  [SupportedChainId.MAINNET]: DEFAULT_SCALE,
  [SupportedChainId.POLYGON]: DEFAULT_SCALE,
  [SupportedChainId.FANTOM]: DEFAULT_SCALE,
  [SupportedChainId.BSC]: {
    ...DEFAULT_SCALE,
    collateralRatio: 1e18,
    poolCeiling: 1e12, // TODO CHECK IF THIS IS CORRECT
    poolBalance: 1e18, // TODO CHECK IF THIS IS CORRECT
  },
}

export const NUMBER_OF_POOLS: { [chainId in SupportedChainId]?: number } = {
  [SupportedChainId.MAINNET]: 3,
  [SupportedChainId.POLYGON]: 4,
  [SupportedChainId.FANTOM]: 20,
}

const initialState = {
  status: DeiStatus.LOADING,
  prices: {
    collateral: 0,
    dei: 0,
    deus: 0,
  },
  collateralRatio: 0,
  mintingFee: 0,
  redemptionFee: 0,
  poolBalance: 0,
  poolCeiling: 0,
  mintPaused: false,
  redeemPaused: false,
}

export const fetchPrices = createAsyncThunk<Prices, { chainId: number }>('dei/fetchPrices', async ({ chainId }) => {
  if (!chainId) throw new Error('No chainId present')
  const { href: url } = new URL(`/dei/price?chainId=${chainId}`, ORACLE_BASE_URL)

  // Destruct the response directly so if these params don't exist it will throw an error.
  const { collateral_price, dei_price, deus_price }: OracleResponse = await makeHttpRequest(url)
  return {
    collateral: collateral_price,
    dei: dei_price,
    deus: deus_price,
  } as Prices
})

const deiSlice = createSlice({
  name: 'dei',
  initialState,
  reducers: {
    updateStatus: (state, { payload }) => {
      state.status = payload
    },
    updateCollateralRatio: (state, { payload }) => {
      state.collateralRatio = payload
    },
    updatePoolBalance: (state, { payload }) => {
      state.poolBalance = payload
    },
    updatePoolCeiling: (state, { payload }) => {
      state.poolCeiling = payload
    },
    updateMintingFee: (state, { payload }) => {
      state.mintingFee = payload
    },
    updateRedemptionFee: (state, { payload }) => {
      state.redemptionFee = payload
    },
    updateMintPaused: (state, { payload }) => {
      state.mintPaused = payload
    },
    updateRedeemPaused: (state, { payload }) => {
      state.redeemPaused = payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.pending, (state) => {
        if (state.status === DeiStatus.OK) {
          state.status = DeiStatus.REFRESHING
        } else {
          state.status = DeiStatus.LOADING
        }
      })
      .addCase(fetchPrices.fulfilled, (state, { payload }) => {
        state.status = DeiStatus.OK
        state.prices = payload
      })
      .addCase(fetchPrices.rejected, () => {
        console.log('Unable to fetch DEI prices')
        return {
          ...initialState,
          status: DeiStatus.ERROR,
        }
      })
  },
})

const { actions, reducer } = deiSlice
export const {
  updateStatus,
  updateCollateralRatio,
  updatePoolBalance,
  updatePoolCeiling,
  updateMintingFee,
  updateRedemptionFee,
  updateMintPaused,
  updateRedeemPaused,
} = actions
export default reducer
