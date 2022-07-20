import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Percent, Token } from '@sushiswap/core-sdk'

export enum TypedField {
  COLLATERAL,
  BORROW,
}

export enum BorrowAction {
  BORROW = 'borrow',
  REPAY = 'repay',
}

export enum LenderVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export interface UnserializedBorrowPool {
  contract: Token
  token0: Token
  token1: Token
  abi: any
  version: LenderVersion
  composition: string
  oracle: string
  generalLender: string
  lpPool: string
  pair0?: string[]
  pair1?: string[]
  type: string
  liquidationFee: number
  mintHelper: string
}

export interface BorrowPool extends Omit<UnserializedBorrowPool, 'liquidationFee'> {
  liquidationFee: Percent
}

export interface BorrowState {
  typedValue: string
  typedField: TypedField
  attemptingTxn: boolean
  showReview: boolean
  error?: string
  pools: UnserializedBorrowPool[]
}

const initialState: BorrowState = {
  typedValue: '',
  typedField: TypedField.COLLATERAL,
  attemptingTxn: false,
  showReview: false,
  error: undefined,
  pools: [],
}

export const borrowSlice = createSlice({
  name: 'borrow',
  initialState,
  reducers: {
    setBorrowState: (state, action: PayloadAction<BorrowState>) => {
      state.typedValue = action.payload.typedValue
      state.typedField = action.payload.typedField
      state.attemptingTxn = action.payload.attemptingTxn
      state.showReview = action.payload.showReview
      state.error = action.payload.error
    },
    setPools: (state, action: PayloadAction<UnserializedBorrowPool[]>) => {
      state.pools = action.payload
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

export const { setBorrowState, setAttemptingTxn, setShowReview, setPools, setError } = borrowSlice.actions
export default borrowSlice.reducer
