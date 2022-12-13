import { useCallback, useMemo } from 'react'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useCLQDRContract } from 'hooks/useContract'
import { createTransactionCallback, TransactionCallbackState } from 'utils/web3'
import { toBN } from 'utils/numbers'
import { useCalcSharesFromAmount } from 'hooks/useClqdrPage'

export function useDepositLQDRCallback(amountIn: string): {
  state: TransactionCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const CLQDRContract = useCLQDRContract()
  const shares = useCalcSharesFromAmount(amountIn)

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !CLQDRContract) {
        throw new Error('Missing dependencies.')
      }

      const amountInBN = toBN(amountIn).times(1e18).toFixed(0)
      const args = [amountInBN, shares]
      return {
        address: CLQDRContract.address,
        calldata: CLQDRContract.interface.encodeFunctionData('deposit', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, CLQDRContract, amountIn, shares])

  return useMemo(() => {
    if (!account || !chainId || !library || !CLQDRContract) {
      return {
        state: TransactionCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    const summary = `Minting ${toBN(shares).div(1e18).toFixed()} cLQDR by ${amountIn} LQDR`

    return {
      state: TransactionCallbackState.VALID,
      error: null,
      callback: () => createTransactionCallback('deposit', constructCall, addTransaction, summary, account, library),
    }
  }, [account, chainId, library, shares, CLQDRContract, amountIn, constructCall, addTransaction])
}
