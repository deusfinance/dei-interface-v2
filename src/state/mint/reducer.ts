import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState, useAppSelector } from 'state'

// deiAmountOut, usdcAmountIn, deusAmountIn
export type ProxyValues = Array<string>

export interface MintState {
  value: string
  proxyLoading: boolean
  isProxyMinter: boolean
  proxyValues: ProxyValues
  attemptingTxn: boolean
  showReview: boolean
  error?: string
}

const initialState: MintState = {
  value: '',
  proxyLoading: false,
  isProxyMinter: false,
  proxyValues: [],
  attemptingTxn: false,
  showReview: false,
  error: undefined,
}

export const mintSlice = createSlice({
  name: 'mint',
  initialState,
  reducers: {
    setMintState: (state, action: PayloadAction<MintState>) => {
      state.value = action.payload.value
      state.proxyLoading = action.payload.proxyLoading
      state.isProxyMinter = action.payload.isProxyMinter
      state.proxyValues = action.payload.proxyValues
      state.attemptingTxn = action.payload.attemptingTxn
      state.showReview = action.payload.showReview
      state.error = action.payload.error
    },
    setProxyLoading: (state, action: PayloadAction<boolean>) => {
      state.proxyLoading = action.payload
    },
    setIsProxyMinter: (state, action: PayloadAction<boolean>) => {
      state.isProxyMinter = action.payload
    },
    setProxyValues: (state, action: PayloadAction<ProxyValues>) => {
      state.proxyValues = action.payload
    },
    setAttemptingTxn: (state, action: PayloadAction<boolean>) => {
      state.attemptingTxn = action.payload
    },
    setShowReview: (state, action: PayloadAction<boolean>) => {
      state.showReview = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
  },
})

export const {
  setMintState,
  setProxyLoading,
  setIsProxyMinter,
  setProxyValues,
  setAttemptingTxn,
  setShowReview,
  setError,
} = mintSlice.actions

export function useMintState(): MintState {
  return useAppSelector((state: AppState) => state.mint)
}

export default mintSlice.reducer
