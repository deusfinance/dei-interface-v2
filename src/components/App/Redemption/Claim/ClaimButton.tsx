import React, { useState } from 'react'
import styled from 'styled-components'

import { PrimaryButton } from 'components/Button'
import useWeb3React from 'hooks/useWeb3'
import { SupportedChainId } from 'constants/chains'
import { RowCenter } from 'components/Row'
import { DotFlashing } from 'components/Icons'

const RemainingWrap = styled(RowCenter)`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  opacity: 0.4;
  background-color: ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.white};
  height: 25px;
  font-size: 12px;
`

const RemainingBlock = styled.div<{ width?: string }>`
  background-color: ${({ theme }) => theme.primary1};
  height: 2px;
  left: 0;
  bottom: 0;
  z-index: 10;
  position: absolute;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  width: ${({ width }) => width ?? 'unset'};
`

const Button = styled(PrimaryButton)`
  height: 25px;
  padding: 0;
  font-size: 12px;
`

export default function ClaimButton({
  claimableBlock,
  currentBlock,
  onClaim,
  onSwitchNetwork,
}: {
  claimableBlock?: number
  currentBlock?: number
  onClaim?: () => void
  onSwitchNetwork?: () => void
}): JSX.Element {
  const { chainId } = useWeb3React()
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)

  const handleClaim = async () => {
    setAwaitingClaimConfirmation(true)
    if (onClaim) await onClaim()
    setAwaitingClaimConfirmation(false)
  }

  if (chainId && chainId !== SupportedChainId.FANTOM) {
    return <Button onClick={onSwitchNetwork}>Switch to FANTOM</Button>
  }

  if (awaitingClaimConfirmation) {
    return (
      <Button active>
        Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
      </Button>
    )
  }

  if (!claimableBlock || !currentBlock) {
    return <Button disabled>Claim</Button>
  }
  const diff = claimableBlock - currentBlock
  if (diff > 0) {
    const elapsed = diff / (8 * 24 * 60)
    return (
      <RemainingWrap>
        <p>
          Remaining Seconds {Math.abs(diff)}
          {' s'}
        </p>
        <RemainingBlock width={elapsed.toFixed(2) + '%'}></RemainingBlock>
      </RemainingWrap>
    )
  }
  return <Button onClick={handleClaim}>Claim</Button>
}
