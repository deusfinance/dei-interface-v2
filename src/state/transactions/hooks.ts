import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state'

import useWeb3React from 'hooks/useWeb3'
import { addTransaction } from './actions'
import { TransactionDetails, TransactionState, Approval, Vest } from './reducer'

export interface TransactionResponseLight {
  hash: string
}

export function useTransactionAdder(): (
  response: TransactionResponseLight,
  customData?: {
    summary?: string
    approval?: Approval
    vest?: Vest
  }
) => void {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()

  return useCallback(
    (
      response: TransactionResponseLight,
      {
        summary,
        approval,
        vest,
      }: {
        summary?: string
        approval?: Approval
        vest?: Vest
      } = {}
    ) => {
      if (!account || !chainId) return

      const { hash } = response
      if (!hash) {
        throw new Error('No transaction hash found.')
      }

      dispatch(
        addTransaction({
          hash,
          from: account,
          chainId,
          summary,
          approval,
          vest,
        })
      )
    },
    [dispatch, chainId, account]
  )
}

// Returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = useWeb3React()

  const state: TransactionState = useAppSelector((state) => state.transactions)
  return chainId ? state[chainId] ?? {} : {}
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86400000
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()
  if (!transactionHash || !transactions[transactionHash]) return false
  return !transactions[transactionHash].receipt
}

export function useHasPendingApproval(tokenAddress: string | null | undefined, spender: string | null | undefined) {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}

export function useHasPendingVest(hash: string | null | undefined) {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof hash === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const vest = tx.vest
          if (!vest) return false
          return vest.hash === hash && isTransactionRecent(tx)
        }
      }),
    [allTransactions, hash]
  )
}
