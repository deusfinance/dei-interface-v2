import React, { useState } from 'react'
import styled from 'styled-components'

import { ModalHeader, Modal } from 'components/Modal'
import AdvancedOptions from './AdvancedOptions'
import TransactionFee from './TransactionFee'
import ThemeSelector from './ThemeSelector'
import { useUserSlippageTolerance, useSetUserSlippageTolerance, useDarkModeManager } from 'state/user/hooks'

const MainModal = styled(Modal)`
  display: flex;
  max-width: 448px;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
    height: 560px;
  `};
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 0.8rem;
  padding: 1.5rem 0;
  overflow-y: scroll;
  height: auto;
  background: ${({ theme }) => theme.bg1};
`

export default function SettingsModal({
  title,
  isOpen,
  toggleModal,
}: {
  title: string
  isOpen: boolean
  toggleModal: (action: boolean) => void
}) {
  const [deadline, setDeadline] = useState('20')
  const [darkMode, setDarkMode] = useDarkModeManager()

  const [useUserTxnSpeed, useSetUserTxnSpeed] = useState(0)

  const slippageInfo =
    'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.'
  const deadlineInfo = 'Your transaction will revert if it is left confirming for longer than this time.'
  const txnFeeInfo =
    'Adjusts the gas price (transaction fee) for your transaction. Higher GWEI = higher speed = higher fees'

  return (
    <>
      <MainModal
        isOpen={isOpen}
        onBackgroundClick={() => toggleModal(false)}
        onEscapeKeydown={() => toggleModal(false)}
      >
        <ModalHeader onClose={() => toggleModal(false)} title={title} border={true} />
        <Wrapper>
          <ThemeSelector title="Theme" amount={darkMode} setAmount={setDarkMode} />

          <TransactionFee
            title="Txn Speed"
            defaultAmounts={[100, 200, 300]}
            amount={useUserTxnSpeed}
            setAmount={useSetUserTxnSpeed}
            toolTipData={txnFeeInfo}
          />

          <AdvancedOptions
            amount={useUserSlippageTolerance().toString()}
            setAmount={useSetUserSlippageTolerance()}
            title="Slippage Tolerance"
            defaultAmounts={['0.1', '0.5', '1.0']}
            unit={'%'}
            toolTipData={slippageInfo}
          />

          <AdvancedOptions
            amount={deadline}
            setAmount={setDeadline}
            title="Txn Deadline"
            defaultAmounts={['20', '40', '60']}
            unit={'min'}
            toolTipData={deadlineInfo}
          />
        </Wrapper>
      </MainModal>
    </>
  )
}
