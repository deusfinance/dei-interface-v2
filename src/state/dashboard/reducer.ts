import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { INFO_URL } from 'constants/misc'
import { makeHttpRequest } from 'utils/http'

export enum DashboardStatus {
  OK = 'OK',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

const initialState = {
  status: DashboardStatus.LOADING,
  deusPrice: 0,
  deiPrice: 0,
}

export const fetchDeusPrice = createAsyncThunk<any>('dashboard/fetchDeusPrice', async () => {
  // Destruct the response directly so if these params don't exist it will throw an error.
  const { href: url } = new URL(`/info/deus/price`, INFO_URL)
  const deusPrice = await makeHttpRequest(url)
  return deusPrice
})

export const fetchDeiPrice = createAsyncThunk<any>('dashboard/fetchDeiPrice', async () => {
  // Destruct the response directly so if these params don't exist it will throw an error.
  const { href: url } = new URL(`/info/dei/price`, INFO_URL)
  const deiPrice = await makeHttpRequest(url)
  return deiPrice
})

const dataSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updatePriceStatus: (state, { payload }) => {
      state.status = payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeusPrice.pending, (state) => {
        state.status = DashboardStatus.LOADING
      })
      .addCase(fetchDeusPrice.fulfilled, (state, { payload }) => {
        state.status = DashboardStatus.OK
        state.deusPrice = payload
      })
      .addCase(fetchDeusPrice.rejected, () => {
        console.log('Unable to fetch deus price info')
        return {
          ...initialState,
          status: DashboardStatus.ERROR,
        }
      })
      .addCase(fetchDeiPrice.pending, (state) => {
        state.status = DashboardStatus.LOADING
      })
      .addCase(fetchDeiPrice.fulfilled, (state, { payload }) => {
        state.status = DashboardStatus.OK
        state.deiPrice = payload
      })
      .addCase(fetchDeiPrice.rejected, () => {
        console.log('Unable to fetch dei price info')
        return {
          ...initialState,
          status: DashboardStatus.ERROR,
        }
      })
  },
})

const { actions, reducer } = dataSlice
export const { updatePriceStatus } = actions
export default reducer
