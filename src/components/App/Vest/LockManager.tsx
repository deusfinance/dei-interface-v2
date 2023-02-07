import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ZERO } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useCurrency } from 'hooks/useCurrency'
import useWeb3React from 'hooks/useWeb3'
import { useVeDeusContract } from 'hooks/useContract'
import { useVestedInformation } from 'hooks/useVested'

import { DEUS_TOKEN } from 'constants/vest'
import { getDurationSeconds, RoundMode } from 'utils/time'
import { getMaximumDate, getMinimumDateByLockEnd } from 'utils/vest'

import { Modal, ModalHeader } from 'components/Modal'
import { TabWrapper, TabButton } from 'components/Tab'
import { ContextError, InvalidContext, useInvalidContext } from 'components/InvalidContext'
import { PrimaryButtonWide } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { SelectDatePresets } from './InputDate'
import UserLockInformation from './UserLockInformation'
import InputBox from 'components/InputBox'

dayjs.extend(utc)

const StyledModal = styled(Modal)`
  overflow: visible; // date picker needs an overflow
`

const ModalInnerWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 20px;
  padding: 1rem;
  & > * {
    &:nth-last-child(3) {
      margin-top: auto;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.8rem;
  `}
`

export const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}

  ${({ gradientText }) =>
    gradientText &&
    `
    background: -webkit-linear-gradient(92.33deg, #e29d52 -10.26%, #de4a7b 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

const StyledTabButton = styled(TabButton)`
  background: ${({ active, theme }) => (active ? theme.bg3 : theme.bg4)};
  color: ${({ active, theme }) => (active ? 'white' : theme.text2)};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.8rem;
  `};
`

enum ManageAction {
  INCREASE_AMOUNT = 'Increase Amount',
  INCREASE_DURATION = 'Increase Duration',
}

export default function LockManager({
  isOpen,
  onDismiss,
  nftId,
}: {
  isOpen: boolean
  onDismiss: () => void
  nftId: number
}) {
  const invalidContext = useInvalidContext()
  const [selectedAction, setSelectedAction] = useState<ManageAction>(ManageAction.INCREASE_AMOUNT)

  function getMainContent() {
    if (invalidContext !== ContextError.VALID) {
      return <InvalidContext connectText="Connect your Wallet in order to manage your lock." />
    }
    if (selectedAction === ManageAction.INCREASE_AMOUNT) {
      return <IncreaseAmount nftId={nftId} />
    }
    return <IncreaseDuration nftId={nftId} />
  }

  const onDismissProxy = () => {
    setSelectedAction(ManageAction.INCREASE_AMOUNT)
    onDismiss()
  }

  return (
    <StyledModal isOpen={isOpen} onBackgroundClick={onDismissProxy} onEscapeKeydown={onDismissProxy}>
      <ModalHeader title={`Manage Existing Lock #${nftId}`} border onClose={onDismissProxy} />
      <ModalInnerWrapper>
        <TabWrapper>
          <StyledTabButton
            style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
            active={selectedAction === ManageAction.INCREASE_AMOUNT}
            onClick={() => setSelectedAction(ManageAction.INCREASE_AMOUNT)}
          >
            {ManageAction.INCREASE_AMOUNT}
          </StyledTabButton>
          <StyledTabButton
            style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
            active={selectedAction === ManageAction.INCREASE_DURATION}
            onClick={() => setSelectedAction(ManageAction.INCREASE_DURATION)}
          >
            {ManageAction.INCREASE_DURATION}
          </StyledTabButton>
        </TabWrapper>
        {getMainContent()}
      </ModalInnerWrapper>
    </StyledModal>
  )
}

function IncreaseAmount({ nftId }: { nftId: number }) {
  const { account } = useWeb3React()
  const deusCurrency = useCurrency(DEUS_TOKEN.address)
  const deusBalance = useCurrencyBalance(account ?? undefined, deusCurrency ?? undefined)
  const veDEUSContract = useVeDeusContract()
  const [typedValue, setTypedValue] = useState('')
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useHasPendingVest(pendingTxHash)
  const addTransaction = useTransactionAdder()
  const { veDEUSAmount, deusAmount, lockEnd } = useVestedInformation(nftId)

  const INSUFFICIENT_BALANCE = useMemo(() => {
    if (!deusBalance || deusBalance.equalTo(ZERO)) return false
    return new BigNumber(deusBalance.toExact()).isLessThan(typedValue)
  }, [deusBalance, typedValue])

  const amountBN: BigNumber = useMemo(() => {
    if (!typedValue || typedValue === '0' || !deusCurrency) return new BigNumber('0')
    return new BigNumber(typedValue).times(new BigNumber(10).pow(deusCurrency.decimals))
  }, [typedValue, deusCurrency])

  const onLock = useCallback(async () => {
    try {
      if (amountBN.isEqualTo('0') || !veDEUSContract || INSUFFICIENT_BALANCE) return
      setAwaitingConfirmation(true)
      const response = await veDEUSContract.increase_amount(nftId, amountBN.toFixed())
      addTransaction(response, { summary: `Increase vest with ${typedValue} DEUS`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [typedValue, amountBN, nftId, INSUFFICIENT_BALANCE, veDEUSContract, addTransaction])

  if (!deusCurrency) return null

  return (
    <>
      <InputBox currency={deusCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />
      <UserLockInformation
        amount={deusAmount}
        selectedDate={lockEnd}
        title="Current vesting setup:"
        increaseType={'1'}
        isModal={true}
      />
      <UserLockInformation
        amount={typedValue}
        selectedDate={lockEnd}
        currentVotingPower={veDEUSAmount}
        title="New vesting setup:"
        increaseType={'1'}
        isNew={true}
        isModal={true}
      />
      {INSUFFICIENT_BALANCE ? (
        <PrimaryButtonWide disabled>
          <ButtonText>INSUFFICIENT BALANCE</ButtonText>
        </PrimaryButtonWide>
      ) : awaitingConfirmation ? (
        <PrimaryButtonWide>
          <ButtonText>
            Awaiting Confirmation <DotFlashing />
          </ButtonText>
        </PrimaryButtonWide>
      ) : showTransactionPending ? (
        <PrimaryButtonWide>
          <ButtonText>
            Increasing <DotFlashing />
          </ButtonText>
        </PrimaryButtonWide>
      ) : (
        <PrimaryButtonWide onClick={onLock}>
          <ButtonText>Increase Lock Amount</ButtonText>
        </PrimaryButtonWide>
      )}
    </>
  )
}

function IncreaseDuration({ nftId }: { nftId: number }) {
  const deusCurrency = useCurrency(DEUS_TOKEN.address)
  const veDEUSContract = useVeDeusContract()
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const showTransactionPending = useHasPendingVest(pendingTxHash)
  const addTransaction = useTransactionAdder()
  const { deusAmount, lockEnd } = useVestedInformation(nftId)

  const minimumDate = useMemo(() => getMinimumDateByLockEnd(lockEnd), [lockEnd])
  const [selectedDate, setSelectedDate] = useState<Date>(minimumDate)
  const [duration, selectedDateLabel] = useMemo(() => {
    return [getDurationSeconds(selectedDate, RoundMode.ROUND_UP), dayjs.utc(selectedDate).fromNow(true)]
  }, [selectedDate])

  const lockCanIncrease = useMemo(() => {
    return dayjs(lockEnd).isBefore(getMaximumDate(), 'day')
  }, [lockEnd])

  const onLock = useCallback(async () => {
    try {
      if (!veDEUSContract) return
      setAwaitingConfirmation(true)
      const response = await veDEUSContract.increase_unlock_time(nftId, duration)
      addTransaction(response, {
        summary: `Increase vest for #${nftId} to ${selectedDateLabel}`,
        vest: { hash: response.hash },
      })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [nftId, veDEUSContract, addTransaction, duration, selectedDateLabel])

  if (!deusCurrency) return null

  return (
    <>
      <SelectDatePresets
        selectedDate={selectedDate}
        minimumDate={minimumDate}
        maximumDate={getMaximumDate()}
        onDateSelect={setSelectedDate}
        isMobileSize={true}
      />
      <UserLockInformation
        amount={deusAmount}
        selectedDate={lockEnd}
        title="Current vesting setup:"
        increaseType={'2'}
        isModal={true}
      />
      <UserLockInformation
        amount={deusAmount}
        selectedDate={selectedDate}
        title="New vesting setup:"
        increaseType={'2'}
        isNew={true}
        isModal={true}
      />
      {awaitingConfirmation ? (
        <PrimaryButtonWide>
          <ButtonText>
            Awaiting Confirmation <DotFlashing />
          </ButtonText>
        </PrimaryButtonWide>
      ) : showTransactionPending ? (
        <PrimaryButtonWide>
          <ButtonText>
            Increasing <DotFlashing />
          </ButtonText>
        </PrimaryButtonWide>
      ) : !lockCanIncrease ? (
        <PrimaryButtonWide disabled>
          <ButtonText>Maximum Lock Reached</ButtonText>
        </PrimaryButtonWide>
      ) : (
        <PrimaryButtonWide onClick={onLock}>
          <ButtonText>Increase Duration</ButtonText>
        </PrimaryButtonWide>
      )}
    </>
  )
}
