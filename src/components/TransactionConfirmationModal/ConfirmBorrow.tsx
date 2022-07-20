import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'

import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { BorrowAction, BorrowPool, LenderVersion, TypedField } from 'state/borrow/reducer'
import {
  useAvailableForWithdrawal,
  useCollateralPrice,
  useGlobalPoolData,
  useLiquidationPrice,
} from 'hooks/usePoolData'

import { formatDollarAmount } from 'utils/numbers'

import { PrimaryButton } from 'components/Button'
import TransactionConfirmationModal, { ConfirmationContent, TransactionErrorContent } from './index'
import ImageWithFallback from 'components/ImageWithFallback'
import { DualImageWrapper } from 'components/DualImage'
import { Warning } from 'components/Warning'

const MainWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 1.5rem 1.25rem;
  overflow: visible;
`

const BottomWrapper = styled(MainWrapper)`
  gap: 0.5rem;
`

const CurrencyRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  background: ${({ theme }) => theme.bg1};
  padding: 0.5rem 0;
  border-radius: 10px;

  & > * {
    &:last-child {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: bold;
    }
  }
`

const InfoRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 5px;
  font-size: 0.8rem;
  overflow: visible;

  & > * {
    overflow: visible;
    position: relative;
    z-index: 0;
    &:last-child {
      color: ${({ theme }) => theme.text3};
    }
  }
`

const Disclaimer = styled.div`
  display: block;
  align-text: center;
  text-align: center;
  font-size: 0.7rem;
  border-radius: 5px;
  padding: 0.7rem;
`

export default function ConfirmBorrow({
  isOpen,
  onDismiss,
  onConfirm,
  attemptingTxn,
  txHash,
  errorMessage,
  currency,
  pool,
  amount,
  typedField,
  action,
}: {
  isOpen: boolean
  onDismiss: () => void
  onConfirm: () => void
  attemptingTxn: boolean
  txHash: string
  errorMessage?: string
  currency: Currency | undefined
  pool: BorrowPool
  amount: CurrencyAmount<NativeCurrency | Token> | null | undefined
  typedField: TypedField
  action: BorrowAction
}) {
  const isBorrowCurrency = useMemo(() => typedField === TypedField.BORROW, [typedField])
  const logo0 = useCurrencyLogo(isBorrowCurrency ? currency?.wrapped.address : pool.token0.address)
  const logo1 = useCurrencyLogo(pool ? pool.token1.address : undefined)
  const liquidationPrice = useLiquidationPrice(pool)
  const { borrowFee } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)
  const { availableForWithdrawal } = useAvailableForWithdrawal(pool)

  const method = useMemo(() => {
    return action === BorrowAction.BORROW && isBorrowCurrency
      ? `Borrow ${currency?.symbol}`
      : action === BorrowAction.BORROW
      ? 'Deposit collateral'
      : isBorrowCurrency
      ? `Repay ${currency?.symbol}`
      : 'Withdraw collateral'
  }, [action, currency, isBorrowCurrency])

  const summary = useMemo(() => {
    const type =
      action === BorrowAction.BORROW && isBorrowCurrency
        ? 'Borrow'
        : action === BorrowAction.BORROW
        ? 'Deposit'
        : isBorrowCurrency
        ? 'Repay'
        : 'Withdraw'
    return `${type} ${amount?.toSignificant()} ${currency?.symbol}`
  }, [action, currency, amount, isBorrowCurrency])

  const showDangerousWithdrawalWarning = useMemo(() => {
    if (!amount || isBorrowCurrency || action !== BorrowAction.REPAY) return false
    const HALF_AVAILABLE = new BigNumber(parseFloat(availableForWithdrawal)).times(0.5)
    return new BigNumber(amount.toExact()).gt(HALF_AVAILABLE)
  }, [amount, availableForWithdrawal, isBorrowCurrency, action])

  const showDangerousExpireWarning = useMemo(() => {
    if (pool.version == LenderVersion.V1) return false
    if (
      (action == BorrowAction.BORROW && typedField == TypedField.BORROW) ||
      (action == BorrowAction.REPAY && typedField == TypedField.COLLATERAL)
    )
      return true
    return false
  }, [pool, action, typedField])

  function getImage() {
    if (!isBorrowCurrency) {
      return (
        <DualImageWrapper>
          <ImageWithFallback src={logo0} width={30} height={30} alt={`${pool.token0.symbol} Logo`} round />
          <ImageWithFallback src={logo1} width={30} height={30} alt={`${pool.token1.symbol} Logo`} round />
        </DualImageWrapper>
      )
    }
    return <ImageWithFallback src={logo0} width={30} height={30} alt={`${currency?.symbol} Logo`} round />
  }

  function getConfirmationContent() {
    return (
      <ConfirmationContent
        title="Confirm Action"
        onDismiss={onDismiss}
        mainContent={
          <MainWrapper>
            <CurrencyRow>
              <div>{getImage()}</div>
              <div>{currency?.symbol}</div>
            </CurrencyRow>
            <InfoRow>
              <div>Action</div>
              <div>{method}</div>
            </InfoRow>
            <InfoRow>
              <div>Amount</div>
              <div>{amount?.toSignificant(6)}</div>
            </InfoRow>
            <InfoRow>
              <div>LP Token Price</div>
              <div>{formatDollarAmount(parseFloat(collateralPrice), 2)}</div>
            </InfoRow>
            <InfoRow>
              <div>Liquidation Price</div>
              <div>{formatDollarAmount(parseFloat(liquidationPrice), 2)}</div>
            </InfoRow>
            <InfoRow>
              <div>Borrow Fee</div>
              <div>{borrowFee.toSignificant()}%</div>
            </InfoRow>
          </MainWrapper>
        }
        bottomContent={
          <BottomWrapper>
            {showDangerousWithdrawalWarning && (
              <Warning>
                WARNING: You are about to withdraw more than 50% of your available collateral. This will result in your
                liquidation price moving into dangerous territory.
              </Warning>
            )}
            {showDangerousExpireWarning && (
              <Warning>
                WARNING: This transaction should be minted in the 30s. Make sure your gas price is enough.
              </Warning>
            )}
            <Disclaimer>
              You are about to {method}. By confirming this transaction you acknowledge you know what you are doing and
              are aware of the risks involved.
            </Disclaimer>
            <PrimaryButton onClick={onConfirm}>Confirm</PrimaryButton>
          </BottomWrapper>
        }
      />
    )
  }

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      summary={summary}
      // currencyToAdd={currency}
      content={
        errorMessage ? (
          <TransactionErrorContent onDismiss={onDismiss} message={errorMessage} />
        ) : (
          getConfirmationContent()
        )
      }
    />
  )
}
