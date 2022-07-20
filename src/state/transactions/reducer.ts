import { createReducer } from '@reduxjs/toolkit'

import {
  addTransaction,
  clearAllTransactions,
  checkedTransaction,
  finalizeTransaction,
  SerializableTransactionReceipt,
} from './actions'

const now = () => new Date().getTime()

export interface Approval {
  tokenAddress?: string
  spender?: string
}

export interface Vest {
  hash?: string
}

export interface TransactionDetails {
  hash: string
  approval?: Approval
  vest?: Vest
  summary?: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTransaction, (state, { payload: { chainId, from, hash, summary, approval, vest } }) => {
      if (state[chainId]?.[hash]) {
        throw new Error('Attempted to add existing transaction.')
      }
      const txs = state[chainId] ?? {}
      txs[hash] = {
        hash,
        from,
        summary,
        approval,
        vest,
        addedTime: now(),
      }
      txs[hash] = { hash, from, summary, approval, vest, addedTime: now() }
      state[chainId] = txs
    })
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
)
