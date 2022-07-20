import { createReducer } from '@reduxjs/toolkit'

import { updateUserSlippageTolerance, updateMatchesDarkMode, updateUserDarkMode } from './actions'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  matchesDarkMode: boolean // whether the dark mode media query matches
  userDarkMode: boolean | null // the user's choice for dark mode or light mode

  // user defined slippage tolerance in percentages (userSlipperageTolerance of 80 means 80%)
  // TODO upgrade to a strongly typed version of this, similar to (but not exactly) like Uniswap's Percent type
  userSlippageTolerance: number | 'auto'

  timestamp: number
}

export const initialState: UserState = {
  matchesDarkMode: false,
  userDarkMode: true,
  userSlippageTolerance: 'auto',
  timestamp: currentTimestamp(),
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateUserSlippageTolerance, (state, action) => {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    })
)
