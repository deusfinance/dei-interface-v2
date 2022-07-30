import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type RedeemBalances = {
  collateral: number
  deus: number
}

export interface RedeemState {
  attemptingTxn: boolean
  showReview: boolean
  showClaim: boolean
  redeemBalances: RedeemBalances
  error?: string
}

const initialState: RedeemState = {
  attemptingTxn: false,
  showReview: false,
  error: undefined,
  showClaim: false,
  redeemBalances: {
    collateral: 0,
    deus: 0,
  },
}

export const redeemSlice = createSlice({
  name: 'redeem',
  initialState,
  reducers: {
    setRedeemState: (state, action: PayloadAction<RedeemState>) => {
      state.attemptingTxn = action.payload.attemptingTxn
      state.showReview = action.payload.showReview
      state.error = action.payload.error
    },
    setRedeemBalances: (state, action: PayloadAction<RedeemBalances>) => {
      state.redeemBalances = action.payload
    },
    setShowClaim: (state, action: PayloadAction<boolean>) => {
      state.showClaim = action.payload
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

export const { setRedeemState, setRedeemBalances, setShowClaim, setAttemptingTxn, setShowReview, setError } =
  redeemSlice.actions

export default redeemSlice.reducer
