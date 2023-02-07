import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { useGetPoolData } from 'hooks/useRedemptionPage'
import { IPositions } from 'components/App/Redemption/Claim'
import { useDeusCollectionDelay } from 'state/dei/hooks'
import { getRemainingTime } from 'utils/time'
import { DEUS_TOKEN } from 'constants/tokens'
import { PrimaryButton } from 'components/Button'
import { useRouter } from 'next/router'

const ClaimBar = styled.div<{ width: string }>`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.text3};
  position: relative;
  overflow: hidden;
  height: 36px;
  background: linear-gradient(90deg, #24576d 0%, #144e4a 93.4%);
  z-index: 0;
  display: flex;
  width: 150px;
  align-items: center;
  &:before {
    content: '';
    background-image: linear-gradient(90deg, #1c94c9 0%, #3daba5 93.4%);
    position: absolute;
    width: ${({ width }) => width};
    height: 100%;
    z-index: -1;
  }
  & > p {
    margin-inline: 11px;
    font-size: 10px;
    font-weight: 600;
    font-family: 'Inter';
    color: ${({ theme }) => theme.text1};
    text-align: center;
    width: 100%;
    display: inline-block;
  }
`

const Button = styled(PrimaryButton)`
  width: 150px;
  font-family: 'Inter';
  font-weight: 700;
  height: 36px;
  padding: 0;
  font-size: 14px;
  border-radius: 8px;
`

const DeusClaimBar = () => {
  const router = useRouter()
  const [currentBlock, setCurrentBlock] = useState(Math.floor(Date.now() / 1000))
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const { unRedeemedPositions }: { unRedeemedPositions: IPositions[] } = useGetPoolData()
  const position = unRedeemedPositions[0] ?? unRedeemedPositions[0]
  const timestamp = position?.timestamp.toString()
  const deusRedemptionDelay = useDeusCollectionDelay()
  const claimableBlock = Number(timestamp) + deusRedemptionDelay
  const [isWaiting, setWaiting] = useState(() => claimableBlock - currentBlock > 0)

  useEffect(() => {
    if (isWaiting !== claimableBlock - currentBlock > 0) {
      setWaiting((prev) => !prev)
    }
  }, [claimableBlock, currentBlock])

  if (!Object.is(claimableBlock, NaN)) {
    if (isWaiting) {
      const diff = claimableBlock - currentBlock
      const elapsed = ((deusRedemptionDelay - diff) / deusRedemptionDelay) * 100
      const { hours, minutes, seconds } = getRemainingTime(claimableBlock * 1000)
      return (
        <ClaimBar width={elapsed.toFixed(0) + '%'}>
          <p>
            Claim {DEUS_TOKEN.symbol} in{' '}
            {`${hours.toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })} `}
            :
            {` ${minutes.toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })} `}
            :
            {` ${seconds.toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}`}
          </p>
        </ClaimBar>
      )
    }
    if (!(router.asPath === '/redemption')) {
      return <Button onClick={() => router.push(`/redemption`)}>Claim your {DEUS_TOKEN.symbol}</Button>
    }
  }
  return null
}

export default DeusClaimBar
