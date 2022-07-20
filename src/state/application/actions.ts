import { createAction } from '@reduxjs/toolkit'

import { ApplicationModal, PopupContent } from './reducer'

export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const updateBlockTimestamp = createAction<{
  chainId: number
  blockTimestamp: number
}>('application/updateBlockTimestamp')
export const updateChainId = createAction<{ chainId: number }>('application/updateChainId')
export const setChainConnectivityWarning = createAction<{ chainConnectivityWarning: boolean }>(
  'application/setChainConnectivityWarning'
)
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup = createAction<{
  key?: string
  removeAfterMs?: number | null
  content: PopupContent
}>('application/addPopup')
export const removePopup = createAction<{ key: string }>('application/removePopup')
