import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { useCurrencyBalance } from 'state/wallet/hooks'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useCurrency } from 'hooks/useCurrency'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useWalletModalToggle } from 'state/application/hooks'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'

import { SolidAddress, Locker } from 'constants/addresses'
import { FALLBACK_CHAIN_ID, SupportedChainId } from 'constants/chains'

import { Warning, Balance } from './Labels'
import { InputWrapper, NumericalInput } from 'components/Input'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 5px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  gap: 5px;
  & > * {
    &:first-child {
      margin-right: 5px;
    }
    &:not(first-child) {
      width: fit-content;
      min-width: 200px;
    }
  }
`

const MaxButton = styled.span`
  color: ${({ theme }) => theme.text2};
  &:hover {
    cursor: pointer;
  }
`

export default function ConvertToken() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [typedValue, setTypedValue] = useState('')

  const solidAddress = useMemo(
    () => (chainId && chainId in SolidAddress ? SolidAddress[chainId] : SolidAddress[FALLBACK_CHAIN_ID]),
    [chainId]
  )
  const solidCurrency = useCurrency(solidAddress)
  const balance = useCurrencyBalance(account ?? undefined, solidCurrency ?? undefined)
  const formattedBalance = useMemo(() => (balance ? balance.toSignificant() : '0'), [balance])

  const spender = useMemo(() => (chainId && chainId in Locker ? Locker[chainId] : Locker[FALLBACK_CHAIN_ID]), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(solidCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = solidCurrency && approvalState !== ApprovalState.APPROVED
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [solidCurrency, approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId) return null
    if (awaitingApproveConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApproveLoader) {
      return (
        <PrimaryButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showApprove) {
      return <PrimaryButton onClick={handleApprove}>Approve</PrimaryButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!account) {
      return <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
    }
    if (!isSupportedChainId) {
      return <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
    }
    if (!!getApproveButton()) {
      return <PrimaryButton disabled>Convert Tokens</PrimaryButton>
    }
    return <PrimaryButton onClick={() => null}>Convert Tokens</PrimaryButton>
  }

  return (
    <Wrapper>
      <Warning>This process is irreversible</Warning>
      <Balance>Balance: {formattedBalance} SOLID</Balance>
      <Row>
        <InputWrapper>
          <NumericalInput value={typedValue} onUserInput={setTypedValue} placeholder="Enter an amount" />
          <MaxButton>MAX</MaxButton>
        </InputWrapper>
        {getApproveButton()}
        {getActionButton()}
      </Row>
    </Wrapper>
  )
}
