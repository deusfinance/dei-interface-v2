import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { MaxUint256 } from '@ethersproject/constants'
import { Currency } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { useERC20Contract } from './useContract'
import useERC20Allowance from './useERC20Allowance'

import { useTransactionAdder, useHasPendingApproval } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils/web3'
import { BN_TEN } from 'utils/numbers'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export default function useApproveCallback(
  currency: Currency | undefined,
  spender: string | undefined
): [ApprovalState, () => Promise<void>] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const token = currency?.isToken ? currency : undefined
  const currentAllowance = useERC20Allowance(token, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const TokenContract = useERC20Contract(token?.address)

  const approvalState = useMemo(() => {
    if (!currency) return ApprovalState.UNKNOWN
    if (!spender) return ApprovalState.UNKNOWN
    if (currency.isNative) return ApprovalState.APPROVED
    if (!currentAllowance) return ApprovalState.UNKNOWN

    return currentAllowance.gt(0)
      ? ApprovalState.APPROVED
      : pendingApproval
      ? ApprovalState.PENDING
      : ApprovalState.NOT_APPROVED
  }, [currency, spender, currentAllowance, pendingApproval])

  const approve = useCallback(async () => {
    if (approvalState === ApprovalState.APPROVED || approvalState === ApprovalState.PENDING) {
      console.error('approve was called unnecessarily')
      return
    }

    if (!chainId) {
      console.error('no chainId')
      return
    }

    if (!TokenContract) {
      console.error('TokenContract is null')
      return
    }

    if (!account) {
      console.error('account is null')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    const estimatedGas = await TokenContract.estimateGas.approve(spender, MaxUint256)
    return TokenContract.approve(spender, MaxUint256, {
      gasLimit: calculateGasMargin(estimatedGas),
    })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + token?.symbol,
          approval: { tokenAddress: token?.address, spender },
        })
      })
      .catch((error: Error) => {
        console.error('Failed to approve token for an unknown reason', error)
      })
  }, [approvalState, TokenContract, spender, token, addTransaction, chainId, account])

  return [approvalState, approve]
}

// typedAmount compares with allowance to find is there enough allowance or no.
export function useApproveCallbackWithAmount(
  currency: Currency | undefined,
  spender: string | undefined,
  typedAmount?: string | number | undefined,
  limitedApprove?: boolean
): [ApprovalState, () => Promise<void>] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const token = currency?.isToken ? currency : undefined
  const currentAllowance = useERC20Allowance(token, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const TokenContract = useERC20Contract(token?.address)

  const [amountToApprove, amountToCompare] = useMemo(() => {
    if (token && typedAmount) {
      const typedAmountBN = BN_TEN.pow(token.decimals).times(typedAmount).toString()
      return [limitedApprove ? typedAmountBN : MaxUint256, typedAmountBN]
    }
    return [MaxUint256, 0]
  }, [typedAmount, limitedApprove, token])

  const approvalState = useMemo(() => {
    if (!currency) return ApprovalState.UNKNOWN
    if (!spender) return ApprovalState.UNKNOWN
    if (currency.isNative) return ApprovalState.APPROVED
    if (!currentAllowance) return ApprovalState.UNKNOWN
    if (typedAmount && Number(typedAmount) == 0) return ApprovalState.APPROVED

    const isApproved = currentAllowance.gt(0) ? currentAllowance.gte(amountToCompare) : false

    return isApproved ? ApprovalState.APPROVED : pendingApproval ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED
  }, [currency, spender, typedAmount, amountToCompare, currentAllowance, pendingApproval])

  const approve = useCallback(async () => {
    if (approvalState === ApprovalState.APPROVED || approvalState === ApprovalState.PENDING) {
      console.error('approve was called unnecessarily')
      return
    }

    if (!chainId) {
      console.error('no chainId')
      return
    }

    if (!TokenContract) {
      console.error('TokenContract is null')
      return
    }

    if (!account) {
      console.error('account is null')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    const estimatedGas = await TokenContract.estimateGas.approve(spender, amountToApprove)

    return TokenContract.approve(spender, amountToApprove, {
      gasLimit: calculateGasMargin(estimatedGas),
    })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: limitedApprove ? 'Approve ' + typedAmount + ' ' + token?.symbol : 'Approve ' + token?.symbol,
          approval: { tokenAddress: token?.address, spender },
        })
      })
      .catch((error: Error) => {
        console.error('Failed to approve token for an unknown reason', error)
      })
  }, [
    approvalState,
    chainId,
    TokenContract,
    account,
    spender,
    amountToApprove,
    addTransaction,
    limitedApprove,
    typedAmount,
    token?.symbol,
    token?.address,
  ])

  return [approvalState, approve]
}
