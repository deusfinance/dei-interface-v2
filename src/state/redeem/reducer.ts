import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export enum UnClaimRedeemState {
  OK = 'OK',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}
export interface RedeemState {
  status: UnClaimRedeemState
  attemptingTxn: boolean
  showReview: boolean
  unClaimed: []
  currentBlocks: []
  info: null
  error?: string
}

const initialState: RedeemState = {
  status: UnClaimRedeemState.OK,
  attemptingTxn: false,
  showReview: false,
  unClaimed: [],
  currentBlocks: [],
  info: null,
  error: undefined,
}

export interface IClaimToken {
  symbol: string
  amount: number
  decimals: number
  depositedBlock: number
  claimableBlock: number
  isClaimed?: boolean
}

export const fetchUnClaimed = createAsyncThunk('redeem/fetchUnClaimed', async ({ address }: { address: string }) => {
  if (!address) throw new Error('No address present')
  // const { href: url } = new URL(`/redeem/deposits?address=${address}&isClaimed=false`, INFO_URL)

  // Destruct the response directly so if these params don't exist it will throw an error.
  // const unClaimed = await makeHttpRequest(url)
  // return unClaimed ?? []
  return []
})

const redeemSlice = createSlice({
  name: 'redeem',
  initialState,
  reducers: {
    setRedeemState: (state, action: PayloadAction<RedeemState>) => {
      state.attemptingTxn = action.payload.attemptingTxn
      state.showReview = action.payload.showReview
      state.error = action.payload.error
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnClaimed.pending, (state) => {
        state.status = UnClaimRedeemState.LOADING
      })
      .addCase(fetchUnClaimed.fulfilled, (state, { payload }) => {
        state.status = UnClaimRedeemState.OK
        // state.unClaimed = payload  //TODO
        state.unClaimed = []
      })
      .addCase(fetchUnClaimed.rejected, () => {
        console.log('Unable to fetch unclaimed tokens')
        return {
          ...initialState,
          status: UnClaimRedeemState.ERROR,
        }
      })
  },
})
const { reducer, actions } = redeemSlice
export const { setRedeemState, setAttemptingTxn, setShowReview, setError } = actions
export default reducer
