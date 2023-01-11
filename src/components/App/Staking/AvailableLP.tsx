import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'

import { tryParseAmount } from 'utils/parse'
import { maxAmountSpend } from 'utils/currency'
import { toBN } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'

import { useWalletModalToggle } from 'state/application/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'

import useWeb3React from 'hooks/useWeb3'
import { useMasterChefContract } from 'hooks/useContract'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'

import { PrimaryButton } from 'components/Button'
import { InputField } from 'components/Input'
import { LiquidityType, Stakings } from 'constants/stakingPools'
import Container from './common/Container'
import { Divider, HStack } from './common/Layout'
import { DotFlashing } from 'components/Icons'

const Wrapper = styled(HStack)`
  justify-content: space-between;
  padding: 12px;
  min-height: 50px;
`

const AvailableLPHeader = styled(Wrapper)`
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  cursor: pointer;
  & > p {
    font-weight: medium;
    &:last-of-type {
      color: ${({ theme }) => theme.text2};
    }
  }
`
const AvailableLPContent = styled(Wrapper)`
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg2};
  padding-block: 0px;
  column-gap: 4px;
`
const AmountInput = styled(InputField)`
  background-color: transparent;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  font-weight: medium;
`
const ActionButton = styled(PrimaryButton)`
  height: 36px !important;
  width: 104px !important;
  font-size: 0.875rem;
  font-weight: bold;
  backdrop-filter: blur(9px);
  border-radius: 8px;
`

const AvailableLP = ({ pool }: { pool: LiquidityType }) => {
  const { account, chainId } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const toggleWalletModal = useWalletModalToggle()
  const addTransaction = useTransactionAdder()

  const lpCurrency = pool.lpToken
  const lpCurrencyBalance = useCurrencyBalance(account ?? undefined, lpCurrency)

  const [amountIn, setAmountIn] = useState<string>('')

  const stakingPool = Stakings.find((p) => p.id === pool.id) || Stakings[0]
  const masterChefContract = useMasterChefContract(stakingPool)

  const currencyAmount = useMemo(() => {
    return tryParseAmount(amountIn, lpCurrency || undefined)
  }, [amountIn, lpCurrency])

  const insufficientBalance = useMemo(() => {
    if (!currencyAmount) return false
    return lpCurrencyBalance?.lessThan(currencyAmount)
  }, [lpCurrencyBalance, currencyAmount])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState(false)

  // TODO: check the spender
  const spender = useMemo(() => (chainId ? stakingPool.masterChef : undefined), [chainId, stakingPool.masterChef])
  const [approvalState, approveCallback] = useApproveCallback(lpCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = lpCurrency && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [lpCurrency, approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const onDeposit = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId || !amountIn) return
      setAwaitingDepositConfirmation(true)
      const response = await masterChefContract.deposit(stakingPool?.pid, toBN(amountIn).times(1e18).toFixed(), account)
      addTransaction(response, { summary: `Deposit`, vest: { hash: response.hash } })
      setAwaitingDepositConfirmation(false)
      setAmountIn('')
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingDepositConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, account, isSupportedChainId, amountIn, stakingPool?.pid, addTransaction])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <ActionButton active>
          Awaiting <DotFlashing />
        </ActionButton>
      )
    } else if (showApproveLoader) {
      return (
        <ActionButton active>
          Approving <DotFlashing />
        </ActionButton>
      )
    } else if (showApprove) {
      return <ActionButton onClick={handleApprove}>Approve</ActionButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <ActionButton onClick={toggleWalletModal}>Connect Wallet</ActionButton>
    } else if (showApprove) {
      return null
    } else if (insufficientBalance) {
      return <ActionButton disabled>Insufficient</ActionButton>
    } else if (awaitingDepositConfirmation) {
      return (
        <ActionButton>
          Staking <DotFlashing />
        </ActionButton>
      )
    } else {
      return <ActionButton onClick={() => onDeposit()}>Stake</ActionButton>
    }
  }

  return (
    <Container>
      <>
        <AvailableLPHeader onClick={() => setAmountIn(maxAmountSpend(lpCurrencyBalance)?.toExact() || '')}>
          <p>{stakingPool.token?.symbol} Available:</p>
          <p>{lpCurrencyBalance?.toSignificant(6)}</p>
        </AvailableLPHeader>
        <Divider backgroundColor="#101116" />
        <AvailableLPContent>
          <AmountInput
            value={amountIn}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setAmountIn(event.target.value)
            }}
            placeholder="Enter amount"
          />
          {getApproveButton()}
          {getActionButton()}
        </AvailableLPContent>
      </>
    </Container>
  )
}

export default AvailableLP
