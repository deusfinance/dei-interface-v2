import React, { useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { PrimaryButton } from 'components/Button'
import useWeb3React from 'hooks/useWeb3'
// import { SupportedChainId } from 'constants/chains'
import { RowCenter } from 'components/Row'
import { DotFlashing } from 'components/Icons'
import { getRemainingTime } from 'utils/time'
import { useDeusCollectionDelay } from 'state/dei/hooks'
import { IToken } from '.'
import { ChainInfo } from 'constants/chainInfo'
import { GradientButtonRow, GradientButtonText } from 'components/App/StableCoin'

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
  height: 45px;
  padding: 0;
  font-size: 14px;
  border-radius: 8px;
`

const GradientButtonWrap = styled(PrimaryButton)`
  background: ${({ theme }) => theme.specialBG1};
  border-radius: 12px;
  padding: 2px;
  width: 100%;
  height: 45px;
  cursor: pointer;
`

export default function ClaimButton({
  token,
  claimableBlock,
  currentBlock,
  onClaim,
  onSwitchNetwork,
}: {
  token: IToken
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

  const deusRedemptionDelay = useDeusCollectionDelay()

  if (chainId && chainId !== token.chainId) {
    return (
      <GradientButtonWrap onClick={onSwitchNetwork}>
        <GradientButtonRow>
          <GradientButtonText style={{ fontSize: '16px' }}>
            Switch to {ChainInfo[token.chainId]?.label}
          </GradientButtonText>
        </GradientButtonRow>
      </GradientButtonWrap>
    )
  } else if (awaitingClaimConfirmation) {
    return (
      <Button active>
        Awaiting Confirmation <DotFlashing />
      </Button>
    )
  } else if (!claimableBlock || !currentBlock) {
    return <Button disabled>Claim</Button>
  }

  const diff = claimableBlock - currentBlock
  if (diff > 0) {
    const { hours, minutes, seconds } = getRemainingTime(claimableBlock * 1000)
    const elapsed = ((deusRedemptionDelay - diff) / deusRedemptionDelay) * 100

    return (
      <RemainingWrap>
        {isMobile ? <p>{`${hours}:${minutes}:${seconds}`}</p> : <p>{`${hours}:${minutes}:${seconds} Remaining`}</p>}
        <RemainingBlock width={elapsed.toFixed(0) + '%'}></RemainingBlock>
      </RemainingWrap>
    )
  }
  return <Button onClick={handleClaim}>Claim</Button>
}
