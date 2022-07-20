import { createReducer, nanoid } from '@reduxjs/toolkit'

import {
  addPopup,
  removePopup,
  setOpenModal,
  setChainConnectivityWarning,
  updateBlockNumber,
  updateBlockTimestamp,
  updateChainId,
} from './actions'

export enum ApplicationModal {
  WALLET = 'WALLET',
  NETWORK = 'NETWORK',
  DASHBOARD = 'DASHBOARD',
  VOUCHER = 'VOUCHER',
}

export type PopupContent = {
  txn: {
    hash: string
    success: boolean
    summary?: string
  }
}

export type Popup = {
  key: string
  show: boolean
  content: PopupContent
  removeAfterMs: number | null
}

export type PopupList = Array<Popup>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly blockTimestamp: { readonly [chainId: number]: number }
  readonly chainConnectivityWarning: boolean
  readonly chainId: number | null
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
}

const initialState: ApplicationState = {
  blockNumber: {},
  blockTimestamp: {},
  chainConnectivityWarning: false,
  chainId: null,
  openModal: null,
  popupList: [],
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, { payload }) => {
      const { chainId, blockNumber } = payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(updateBlockTimestamp, (state, action) => {
      const { chainId, blockTimestamp } = action.payload
      if (typeof state.blockTimestamp[chainId] !== 'number') {
        state.blockTimestamp[chainId] = blockTimestamp
      } else {
        state.blockTimestamp[chainId] = Math.max(blockTimestamp, state.blockTimestamp[chainId])
      }
    })
    .addCase(updateChainId, (state, { payload }) => {
      const { chainId } = payload
      state.chainId = chainId
    })
    .addCase(setChainConnectivityWarning, (state, action) => {
      const { chainConnectivityWarning } = action.payload
      state.chainConnectivityWarning = chainConnectivityWarning
    })
    .addCase(setOpenModal, (state, { payload }) => {
      state.openModal = payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 25000 } }) => {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    })
    .addCase(removePopup, (state, { payload }) => {
      const { key } = payload
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
)
