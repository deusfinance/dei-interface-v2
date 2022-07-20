import { createAction } from '@reduxjs/toolkit'

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('user/updateMatchesDarkMode')
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('user/updateUserDarkMode')

export const updateUserSlippageTolerance = createAction<{ userSlippageTolerance: number | 'auto' }>(
  'user/updateUserSlippageTolerance'
)
