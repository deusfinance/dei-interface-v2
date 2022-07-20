import { useMemo } from 'react'
import { Currency, CurrencyAmount, NativeCurrency, Token, ZERO } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { TypedField, BorrowAction, BorrowPool } from 'state/borrow/reducer'
import { useBorrowState } from 'state/borrow/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'

import { maxAmountSpend } from 'utils/currency'
import { tryParseAmount } from 'utils/parse'
import { useAvailableForWithdrawal, useAvailableToBorrow, useUserPoolData } from './usePoolData'
import BigNumber from 'bignumber.js'

export enum UserError {
  ACCOUNT = 'ACCOUNT',
  BALANCE = 'BALANCE',
  AMOUNT = 'AMOUNT',
  CAP = 'CAP',
  VALID = 'VALID',
}

export default function useBorrowPage(
  collateralCurrency: Currency | undefined,
  borrowCurrency: Currency | undefined,
  pool: BorrowPool,
  action: BorrowAction
): {
  error: UserError
  typedField: TypedField
  formattedAmounts: string[]
  parsedAmounts: (CurrencyAmount<NativeCurrency | Token> | null | undefined)[]
} {
  const { account, chainId } = useWeb3React()
  const { typedValue, typedField } = useBorrowState()
  const collateralBalance = useCurrencyBalance(account ?? undefined, collateralCurrency)
  const borrowBalance = useCurrencyBalance(account ?? undefined, borrowCurrency)

  const availableToBorrow = useAvailableToBorrow(pool)
  const { userDebt } = useUserPoolData(pool)
  const { availableForWithdrawal } = useAvailableForWithdrawal(pool)

  // Amount typed in either fields
  const typedAmount = useMemo(() => {
    return tryParseAmount(typedValue, typedField === TypedField.COLLATERAL ? collateralCurrency : borrowCurrency)
  }, [collateralCurrency, borrowCurrency, typedValue, typedField])

  // Reset counterCurrency when typing in the other
  const parsedAmounts = useMemo(() => {
    return [
      typedField === TypedField.COLLATERAL ? typedAmount : undefined,
      typedField === TypedField.COLLATERAL ? undefined : typedAmount,
    ]
  }, [typedField, typedAmount])

  // Stringified values purely for user display
  const formattedAmounts = useMemo(() => {
    return [typedField === TypedField.COLLATERAL ? typedValue : '', typedField === TypedField.BORROW ? typedValue : '']
  }, [typedField, typedValue])

  const balanceError = useMemo(() => {
    // adding collateral
    if (typedField === TypedField.COLLATERAL && action === BorrowAction.BORROW) {
      return collateralBalance && parsedAmounts[0] && maxAmountSpend(collateralBalance)?.lessThan(parsedAmounts[0])
    }
    // removing collateral
    if (typedField === TypedField.COLLATERAL && action === BorrowAction.REPAY) {
      return parsedAmounts[0] && new BigNumber(availableForWithdrawal).isLessThan(parsedAmounts[0].toExact())
    }
    // borrowing
    if (action === BorrowAction.BORROW) {
      return (
        availableToBorrow && parsedAmounts[1] && new BigNumber(availableToBorrow).isLessThan(parsedAmounts[1].toExact())
      )
    }
    // repaying
    const debtRepayError = parsedAmounts[1] && new BigNumber(userDebt).isLessThan(parsedAmounts[1].toExact())
    const debtBalanceError =
      parsedAmounts[1] &&
      borrowBalance &&
      new BigNumber(parsedAmounts[1].toExact()).isGreaterThan(borrowBalance?.toExact())
    return debtRepayError || debtBalanceError
  }, [
    collateralBalance,
    userDebt,
    parsedAmounts,
    typedField,
    action,
    availableForWithdrawal,
    availableToBorrow,
    borrowBalance,
  ])

  const error = useMemo(
    () =>
      !account || !chainId
        ? UserError.ACCOUNT
        : parsedAmounts[0]?.equalTo(ZERO)
        ? UserError.AMOUNT
        : balanceError
        ? UserError.BALANCE
        : UserError.VALID,
    [account, chainId, balanceError, parsedAmounts]
  )

  return useMemo(
    () => ({
      error,
      typedField,
      formattedAmounts,
      parsedAmounts,
    }),
    [error, typedField, formattedAmounts, parsedAmounts]
  )
}
