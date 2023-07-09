import { useCallback, useMemo } from 'react'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useReimbursementContract } from 'hooks/useContract'
import { createTransactionCallback, TransactionCallbackState } from 'utils/web3'
import { toBN } from 'utils/numbers'

export function useReimbursementCallback(
  amountIn: string,
  totalClaimableAmount: string,
  proof: string
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const reimbursementContract = useReimbursementContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !reimbursementContract || !amountIn) {
        throw new Error('Missing dependencies.')
      }

      const amountInBN = toBN(amountIn).times(1e18).toFixed(0).toString()
      const totalClaimableAmountBN = toBN(totalClaimableAmount).times(1e18).toFixed(0).toString()

      const args = [amountInBN, totalClaimableAmountBN, proof, account]
      console.log({ args })

      return {
        address: reimbursementContract.address,
        calldata: reimbursementContract.interface.encodeFunctionData('claimCollateral', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, reimbursementContract, amountIn, totalClaimableAmount, proof])

  return useMemo(() => {
    if (!account || !chainId || !library || !reimbursementContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    const summary = `Claimed Collateral`

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () =>
        createTransactionCallback('claimCollateral', constructCall, addTransaction, summary, account, library),
    }
  }, [account, chainId, library, reimbursementContract, constructCall, addTransaction])
}

export function useClaimDeusCallback(
  amountIn: string,
  totalClaimableAmount: string,
  proof: string
): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const reimbursementContract = useReimbursementContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !reimbursementContract || !amountIn) {
        throw new Error('Missing dependencies.')
      }

      const amountInBN = toBN(amountIn).times(1e18).toFixed(0).toString()
      const args = [amountInBN, totalClaimableAmount, proof, account]
      console.log({ args })

      return {
        address: reimbursementContract.address,
        calldata: reimbursementContract.interface.encodeFunctionData('claimDeus', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, reimbursementContract, amountIn, totalClaimableAmount, proof])

  return useMemo(() => {
    if (!account || !chainId || !library || !reimbursementContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    const summary = `Claimed DEUS`

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () => createTransactionCallback('claimDeus', constructCall, addTransaction, summary, account, library),
    }
  }, [account, chainId, library, reimbursementContract, constructCall, addTransaction])
}
