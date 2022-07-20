import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { useWalletModalToggle } from 'state/application/hooks'
import { useGeneralLenderContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

import { BorrowPools } from 'constants/borrow'
import { SupportedChainId } from 'constants/chains'
import { constructPercentage } from 'utils/prices'

import { Modal, ModalHeader } from 'components/Modal'
import { ConfirmationAnimation, DotFlashing } from 'components/Icons'
import { PrimaryButton } from 'components/Button'

const ModalInnerWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 30px;
  padding: 2rem;
`

const StyledPrimaryButton = styled(PrimaryButton)`
  font-size: 0.8rem;
  padding: 1rem 0;
`

export default function MaintenanceModal({ content }: { content: string }) {
  const rpcChangerCallback = useRpcChangerCallback()
  const pool = BorrowPools[0]
  const generalLender = useGeneralLenderContract({ ...pool, liquidationFee: constructPercentage(80) })
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const { account, chainId } = useWeb3React()

  const onClaim = useCallback(async () => {
    try {
      if (!generalLender || !account) return
      setAwaitingClaimConfirmation(true)
      await generalLender.claimAndWithdraw([pool.lpPool], account)
      setAwaitingClaimConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimConfirmation(false)
    }
  }, [generalLender, pool, account])

  function getClaimButton() {
    if (!chainId || !account) {
      return (
        <>
          <div>Connect your wallet in order to claim your solid & sex rewards.</div>
          <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
        </>
      )
    }
    if (!isSupportedChainId) {
      return (
        <>
          <div>You are not connected to the Fantom Opera Network.</div>
          <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
        </>
      )
    }
    if (awaitingClaimConfirmation) {
      return (
        <StyledPrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </StyledPrimaryButton>
      )
    }
    return <StyledPrimaryButton onClick={onClaim}>Claim Rewards</StyledPrimaryButton>
  }

  return (
    <Modal isOpen={true} onBackgroundClick={() => null} onEscapeKeydown={() => null}>
      <ModalHeader title="Maintenance" border={true} onClose={() => null} hideClose />
      <ModalInnerWrapper>
        <ConfirmationAnimation size="80px" />
        {content}
        {getClaimButton()}
      </ModalInnerWrapper>
    </Modal>
  )
}
