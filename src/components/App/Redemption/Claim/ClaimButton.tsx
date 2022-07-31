import React, { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { PrimaryButton } from 'components/Button'
import useWeb3React from 'hooks/useWeb3'
import { SupportedChainId } from 'constants/chains'
import { RowCenter } from 'components/Row'
import { DotFlashing } from 'components/Icons'
import { getRemainingTime } from 'utils/time'

const RemainingWrap = styled(RowCenter)`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.white};
  height: 40px;
  font-size: 12px;
  cursor: progress;

  & > * {
    &:first-child {
      z-index: 100;
      font-family: 'Inter';
      font-weight: 700;
    }
  }
`

const RemainingBlock = styled.div<{ width?: string }>`
  background: ${({ theme }) => theme.primary1};
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
  width: ${({ width }) => width ?? 'unset'};
`

const Button = styled(PrimaryButton)`
  font-family: 'Inter';
  font-weight: 700;
  height: 40px;
  padding: 0;
  font-size: 12px;
  border-radius: 8px;
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
  const { hours, minutes, seconds } = getRemainingTime(diff)
  if (diff > 0) {
    const Eight_hours = 8 * 60 * 60
    const elapsed = (diff / Eight_hours) * 100
    return (
      <RemainingWrap>
        {isMobile ? <p>{`${hours}:${minutes}:${seconds}`}</p> : <p>{`${hours}:${minutes}:${seconds} Remaining`}</p>}
        <RemainingBlock width={elapsed.toFixed(0) + '%'}></RemainingBlock>
      </RemainingWrap>
    )
  }
  return <Button onClick={handleClaim}>Claim</Button>
}
