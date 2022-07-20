import React from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useVestedAPY, useVestedInformation } from 'hooks/useVested'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'

import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { HorPartition } from 'components/Partition'
import { PrimaryButton } from 'components/Button'
import { Modal, ModalHeader } from 'components/Modal'

dayjs.extend(utc)

const StyledModal = styled(Modal)`
  overflow: visible; // date picker needs an overflow
`

const ModalInnerWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  padding: 1rem;

  & > * {
    &:last-child {
      margin-top: 10px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.8rem;
  `}
`

const Title = styled.div`
  font-size: 1.5rem;
  margin-bottom: 5px;
  padding-bottom: 5px;
  font-weight: bold;
  color: ${({ theme }) => theme.primary3};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 1.3rem;
  `}
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
  font-size: 0.8rem;

  & > * {
    color: ${({ theme }) => theme.text1};
    &:last-child {
      color: ${({ theme }) => theme.text2};
    }
    & > span {
      color: ${({ theme }) => theme.primary3};
      font-size: 0.6rem;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `}
`

export default function APYManager({
  isOpen,
  onDismiss,
  nftId,
  toggleLockManager,
}: {
  isOpen: boolean
  onDismiss: () => void
  nftId: number
  toggleLockManager: (nftId: number) => void
}) {
  const { deusAmount, veDEUSAmount, lockEnd } = useVestedInformation(nftId)
  const { lockedVeDEUS, globalAPY, userAPY, antiDilutiveAPY, deiAPY, bribesAPY } = useVestedAPY(nftId, lockEnd)
  const deusPrice = useDeusPrice()

  return (
    <StyledModal isOpen={isOpen} onBackgroundClick={onDismiss} onEscapeKeydown={onDismiss}>
      <ModalHeader title={`#${nftId} veDEUS NFT`} onClose={onDismiss} />
      <ModalInnerWrapper>
        <Title>APR Breakdown</Title>
        <Row>
          <div>
            Lock End: <span>(UTC)</span>
          </div>
          <div>{dayjs.utc(lockEnd).format('LL')}</div>
        </Row>
        <Row>
          <div>Locked Amount:</div>
          <div>{formatAmount(parseFloat(deusAmount), 2)} DEUS</div>
        </Row>
        <Row>
          <div>Current Voting Power:</div>
          <div>{formatAmount(parseFloat(veDEUSAmount), 2)} DEUS</div>
        </Row>
        <HorPartition />
        <Row>
          <div>DEUS Price: </div>
          <div>{formatDollarAmount(parseFloat(deusPrice), 2)}</div>
        </Row>
        <Row>
          <div>
            DEUS Locked: <span>(veDEUS)</span>
          </div>
          <div>{formatAmount(parseFloat(lockedVeDEUS), 0)}</div>
        </Row>
        <HorPartition />
        <Row>
          <div>
            DEI Lending APR: <span>(paid in DEI)</span>
          </div>
          <div>{formatAmount(parseFloat(deiAPY), 0)}%</div>
        </Row>
        <Row>
          <div>
            APR from Bribes: <span>(paid in Bribes)</span>
          </div>
          <div>{formatAmount(parseFloat(bribesAPY), 0)}%</div>
        </Row>
        <Row>
          <div>
            Anti-Dilution APR: <span>(paid in veDEUS)</span>
          </div>
          <div>{formatAmount(parseFloat(antiDilutiveAPY), 0)}%</div>
        </Row>
        <HorPartition />
        <Row>
          <div>Total APR: </div>
          <div>{formatAmount(parseFloat(globalAPY), 0)}%</div>
        </Row>
        <Row>
          <div>Your APR: </div>
          <div>{formatAmount(parseFloat(userAPY), 0)}%</div>
        </Row>
        <PrimaryButton onClick={() => toggleLockManager(nftId)}>Update Lock</PrimaryButton>
      </ModalInnerWrapper>
    </StyledModal>
  )
}
