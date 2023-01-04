import { updateNavbarOption } from './action'
import { TNAVBAR_OPTIONS } from './types'
import { createReducer } from '@reduxjs/toolkit'

const INITIAL_STATE: Partial<TNAVBAR_OPTIONS> = {}

export default createReducer(INITIAL_STATE, (builder) =>
  builder.addCase(updateNavbarOption, (state, { payload: { payload } }) => {
    state = { ...payload }
    return state
  })
)
