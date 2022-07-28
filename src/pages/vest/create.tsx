import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { ZERO } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useCurrency } from 'hooks/useCurrency'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVeDeusContract } from 'hooks/useContract'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'

import veDEUS_LOGO from '/public/static/images/pages/veDEUS/veDEUS.svg'
import CREATE_LOCK_IMG from '/public/static/images/pages/veDEUS/LockTableauBackground.svg'
import { DEUS_TOKEN } from 'constants/vest'
import { SupportedChainId } from 'constants/chains'
import { veDEUS } from 'constants/addresses'
import { getDurationSeconds, RoundMode } from 'utils/time'
import { getMaximumDate, getMinimumDate } from 'utils/vest'

import InputBox from 'components/InputBox'
import { SelectDatePresets, UserLockInformation } from 'components/App/Vest'
import Hero, { HeroSubtext } from 'components/Hero'
import { PrimaryButton, PrimaryButtonWide } from 'components/Button'
import { Card } from 'components/Card'
import { ArrowBubble, DotFlashing } from 'components/Icons'
import Image from 'next/image'
import { Title } from 'components/App/StableCoin'
import StatsHeader from 'components/StatsHeader'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useVestedAPY } from 'hooks/useVested'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { ArrowDown } from 'react-feather'
import Tableau from 'components/App/StableCoin/Tableau'
import StaticInputBox from 'components/App/Vest/StaticInputBox'

dayjs.extend(utc)

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 540px);

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 30px;
  `}
`

const ReturnWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  overflow: visible;
  font-size: 0.9rem;
  margin-bottom: 20px;

  &:hover {
    cursor: pointer;
  }

  & > * {
    &:first-child {
      transform: rotate(90deg);
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-bottom: 5px;
  `}
`

const CardWrapper = styled(Card)`
  display: flex;
  flex-flow: column wrap;
  background: ${({ theme }) => theme.bg0};
  justify-content: center;
  align-items: center;
  gap: 10px;

  & > * {
    flex: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-flow: column nowrap;
  `}
`

const ActionButton = styled(PrimaryButtonWide)`
  font-family: 'Inter';
  font-weight: 600;
  margin-top: 15px;
`

export default function Create() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()
  const isSupportedChainId = useSupportedChainId()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()
  const [typedValue, setTypedValue] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs.utc().toDate())
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const addTransaction = useTransactionAdder()
  const showTransactionPending = useHasPendingVest(pendingTxHash)

  const { lockedVeDEUS } = useVestedAPY(undefined, getMaximumDate())
  const deusPrice = useDeusPrice()

  const deusCurrency = useCurrency(DEUS_TOKEN.address)

  const deusBalance = useCurrencyBalance(account ?? undefined, deusCurrency ?? undefined)
  const veDEUSContract = useVeDeusContract()
  const spender = useMemo(() => {
    return chainId && chainId in veDEUS ? veDEUS[chainId] : undefined
  }, [chainId])

  const [approvalState, approveCallback] = useApproveCallback(deusCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deusCurrency && approvalState !== ApprovalState.APPROVED && !!typedValue
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deusCurrency, approvalState, typedValue])

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
      const response = await veDEUSContract.create_lock(
        amountBN.toFixed(),
        getDurationSeconds(selectedDate, RoundMode.ROUND_UP)
      )
      addTransaction(response, { summary: `Lock up ${typedValue} DEUS`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [typedValue, amountBN, selectedDate, INSUFFICIENT_BALANCE, veDEUSContract, addTransaction])

  const onReturnClick = useCallback(() => {
    router.push('/vest')
  }, [router])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  function getActionButton() {
    // approve
    if (awaitingApproveConfirmation) {
      return (
        <ActionButton width={'100%'} active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }
    if (showApproveLoader) {
      return (
        <ActionButton width={'100%'} active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }
    if (showApprove) {
      return (
        <ActionButton width={'100%'} onClick={handleApprove}>
          Approve
        </ActionButton>
      )
    }
    // lock
    if (INSUFFICIENT_BALANCE) {
      return (
        <ActionButton width={'100%'} disabled>
          INSUFFICIENT BALANCE
        </ActionButton>
      )
    }
    if (awaitingConfirmation) {
      return (
        <ActionButton width={'100%'} active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }
    if (showTransactionPending) {
      return (
        <ActionButton width={'100%'} active>
          Locking <DotFlashing style={{ marginLeft: '10px' }} />
        </ActionButton>
      )
    }

    return (
      <ActionButton width={'100%'} onClick={onLock}>
        Lock DEUS
      </ActionButton>
    )
  }

  function getMainContent() {
    if (!chainId || !account) {
      return (
        <>
          <div>Connect your Wallet in order to vest your DEUS.</div>
          <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
        </>
      )
    }
    if (!isSupportedChainId) {
      return (
        <>
          <div style={{ marginBottom: '30px' }}>You are not connected to the Fantom Opera Network.</div>
          <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
        </>
      )
    }
    if (!deusCurrency) {
      return (
        <div>
          Experiencing issues with the Fantom RPC, unable to load this page. If this issue persist, try to refresh the
          page.
        </div>
      )
    }

    return (
      <>
        <Tableau title={'Create Lock'} imgSrc={CREATE_LOCK_IMG} />
        <CardWrapper>
          <InputBox currency={deusCurrency} value={typedValue} onChange={(value: string) => setTypedValue(value)} />

          <SelectDatePresets
            selectedDate={selectedDate}
            minimumDate={getMinimumDate()}
            maximumDate={getMaximumDate()}
            onDateSelect={setSelectedDate}
          />
          <ArrowDown />
          <StaticInputBox
            currency={deusCurrency}
            name={'veDEUS'}
            value={typedValue}
            selectedDate={selectedDate}
            onChange={(value: string) => console.log(value)}
            disabled={true}
          />

          {getActionButton()}
          <UserLockInformation amount={typedValue} selectedDate={selectedDate} />
          {/* <GeneralLockInformation /> */}
        </CardWrapper>
      </>
    )
  }

  const items = [
    { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusPrice), 2) },
    { name: 'Total veDEUS Locked', value: formatAmount(parseFloat(lockedVeDEUS), 0) },
  ]

  return (
    <Container>
      <Hero>
        <Image src={veDEUS_LOGO} height={'90px'} alt="Logo" />
        <Title>Create Lock</Title>
        <HeroSubtext>Vest your DEUS for a period of your liking.</HeroSubtext>
        <StatsHeader items={items} hasBox />
      </Hero>

      <Wrapper>
        <ReturnWrapper onClick={onReturnClick}>
          <ArrowBubble size={20} />
          Lock Overview
        </ReturnWrapper>
        {getMainContent()}
      </Wrapper>
    </Container>
  )
}
