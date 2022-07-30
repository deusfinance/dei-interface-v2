import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import Image from 'next/image'
import toast from 'react-hot-toast'

import { useVeDeusContract } from 'hooks/useContract'
import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVestedInformation } from 'hooks/useVested'
import { useVeDistContract } from 'hooks/useContract'

import Pagination from 'components/Pagination'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButtonWhite, PrimaryButtonWide } from 'components/Button'
import { DotFlashing } from 'components/Icons'

import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import { formatAmount } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'
import { ButtonText } from 'pages/vest'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
`

const TableWrapper = styled.table`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
  background: ${({ theme }) => theme.bg1};
  /* border-bottom-right-radius: 12px; */
  /* border-bottom-left-radius: 12px; */
`

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const FirstRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5px;
`

const Cell = styled.td<{
  justify?: boolean
}>`
  align-items: center;
  padding: 5px;
  height: 90px;
`

const NoResults = styled.div`
  text-align: center;
  padding: 20px;
`

const NFTWrap = styled(Column)`
  margin-left: 10px;
  align-items: flex-start;
`

const PaginationWrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 100%;
`

const CellAmount = styled.div`
  font-size: 0.85rem;
  background: linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 0.95rem;
  `};
`

// const CellDescription = styled.div`
//   font-size: 0.6rem;
//   color: ${({ theme }) => theme.text2};
// `

const Name = styled.div`
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 12px;
  `};
`

const Value = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
`

const ZebraStripesRow = styled(Row)<{ isEven?: boolean }>`
  background: ${({ isEven, theme }) => (isEven ? theme.bg2 : theme.bg1)};
`

const ExpirationPassed = styled.div`
  & > * {
    color: ${({ theme }) => theme.yellow4};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: flex;
    width: 100%;
    justify-content: space-between;
  `};
`

const MobileCell = styled.div`
  display: flex;
  justify-content: space-between;
  width: 95%;
  margin-left: 10px;
`

const MobileWrapper = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
`

const TopBorderWrap = styled.div<{ active?: any }>`
  background: ${({ theme }) => theme.primary2};
  padding: 1px;
  border-radius: 8px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.bg0};
  /* flex: 1; */

  &:hover {
    border: 1px solid ${({ theme, active }) => (active ? theme.bg0 : theme.warning)};
  }
`

const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 6px;
  height: 100%;
  width: 100%;
  display: flex;
`

const itemsPerPage = 10

export default function Table({
  nftIds,
  toggleLockManager,
  toggleAPYManager,
  isMobile,
  rewards,
}: {
  nftIds: number[]
  toggleLockManager: (nftId: number) => void
  toggleAPYManager: (nftId: number) => void
  isMobile?: boolean
  rewards: number[]
}) {
  const [offset, setOffset] = useState(0)

  const paginatedItems = useMemo(() => {
    return nftIds.slice(offset, offset + itemsPerPage)
  }, [nftIds, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(nftIds.length / itemsPerPage)
  }, [nftIds])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <>
      <Wrapper>
        <TableWrapper>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((nftId: number, index) => (
                <TableRow
                  key={index}
                  index={index}
                  nftId={nftId}
                  toggleLockManager={toggleLockManager}
                  toggleAPYManager={toggleAPYManager}
                  isMobile={isMobile}
                  reward={rewards[index] ?? 0}
                />
              ))}
          </tbody>
          {paginatedItems.length == 0 && (
            <>
              <div style={{ margin: '0 auto' }}>
                {isMobile ? (
                  <Image src={EMPTY_LOCK_MOBILE} alt="empty-lock-mobile" />
                ) : (
                  <Image src={EMPTY_LOCK} alt="empty-lock" />
                )}
              </div>
              <NoResults>You have no lock!</NoResults>
            </>
          )}
        </TableWrapper>
        <PaginationWrapper>
          {paginatedItems.length > 0 && (
            <Pagination count={nftIds.length} pageCount={pageCount} onPageChange={onPageChange} />
          )}
        </PaginationWrapper>
      </Wrapper>
    </>
  )
}

function TableRow({
  nftId,
  toggleLockManager,
  toggleAPYManager,
  index,
  isMobile,
  reward,
}: {
  nftId: number
  toggleLockManager: (nftId: number) => void
  toggleAPYManager: (nftId: number) => void
  index: number
  isMobile?: boolean
  reward: number
}) {
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [ClaimAwaitingConfirmation, setClaimAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const { deusAmount, veDEUSAmount, lockEnd } = useVestedInformation(nftId)
  const veDEUSContract = useVeDeusContract()
  const addTransaction = useTransactionAdder()
  const showTransactionPending = useHasPendingVest(pendingTxHash)
  const veDistContract = useVeDistContract()

  // subtracting 10 seconds to mitigate this from being true on page load
  const lockHasEnded = useMemo(() => dayjs.utc(lockEnd).isBefore(dayjs.utc().subtract(10, 'seconds')), [lockEnd])

  const onClaim = useCallback(async () => {
    try {
      if (!veDistContract) return
      setClaimAwaitingConfirmation(true)
      const response = await veDistContract.claim(nftId)
      addTransaction(response, { summary: `Claim #${nftId} reward`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setClaimAwaitingConfirmation(false)
    } catch (err) {
      console.log(DefaultHandlerError(err))
      setClaimAwaitingConfirmation(false)
      setPendingTxHash('')
      if (err?.code === 4001) {
        toast.error('Transaction rejected.')
      } else toast.error(DefaultHandlerError(err))
    }
  }, [veDistContract, nftId, addTransaction])

  const onWithdraw = useCallback(async () => {
    try {
      if (!veDEUSContract || !lockHasEnded) return
      setAwaitingConfirmation(true)
      const response = await veDEUSContract.withdraw(nftId)
      addTransaction(response, { summary: `Withdraw #${nftId} from Vesting`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingConfirmation(false)
      setPendingTxHash('')
    }
  }, [veDEUSContract, lockHasEnded, nftId, addTransaction])

  function getExpirationCell() {
    if (!lockHasEnded)
      return (
        <>
          <Name>Expiration</Name>
          <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
          {/* <CellDescription>Expires in {dayjs.utc(lockEnd).fromNow(true)}</CellDescription> */}
        </>
      )
    return (
      <ExpirationPassed>
        <Name>Expired in</Name>
        <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
      </ExpirationPassed>
    )
  }

  function getClaimButton() {
    if (ClaimAwaitingConfirmation) {
      return (
        <PrimaryButtonWide isSmall={true} active>
          <ButtonText>
            Confirming <DotFlashing style={{ marginLeft: '10px' }} />
          </ButtonText>
        </PrimaryButtonWide>
      )
    }
    if (showTransactionPending) {
      return (
        <PrimaryButtonWide isSmall={true} active>
          <ButtonText>
            Claiming <DotFlashing style={{ marginLeft: '10px' }} />
          </ButtonText>
        </PrimaryButtonWide>
      )
    }
    return (
      <PrimaryButtonWide style={{ margin: '0 auto' }} isSmall={true} onClick={onClaim}>
        <ButtonText>Claim {formatAmount(reward, 3)}</ButtonText>
      </PrimaryButtonWide>
    )
  }

  function getClaimWithdrawCell() {
    if (awaitingConfirmation) {
      return (
        <TopBorderWrap>
          <TopBorder>
            <PrimaryButtonWide width={'100%'} disabled>
              <ButtonText style={{ margin: '-6px' }} disabled>
                Confirming <DotFlashing style={{ marginLeft: '10px' }} />
              </ButtonText>
            </PrimaryButtonWide>
          </TopBorder>
        </TopBorderWrap>
      )
    } else if (showTransactionPending) {
      return (
        <TopBorderWrap>
          <TopBorder>
            <PrimaryButtonWide width={'100%'} disabled>
              <ButtonText style={{ margin: '-5px' }} disabled>
                Withdrawing <DotFlashing style={{ marginLeft: '10px' }} />
              </ButtonText>
            </PrimaryButtonWide>
          </TopBorder>
        </TopBorderWrap>
      )
    } else if (lockHasEnded) {
      return (
        <TopBorderWrap>
          <TopBorder>
            <PrimaryButtonWide width={'100%'} disabled onClick={onWithdraw}>
              <ButtonText style={{ margin: '-6px' }} disabled>
                Withdraw
              </ButtonText>
            </PrimaryButtonWide>
          </TopBorder>
        </TopBorderWrap>
      )
    } else if (reward) return getClaimButton()
    return null
  }

  function getTableRow() {
    return (
      <>
        <Cell>
          <RowCenter>
            <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
            <NFTWrap>
              <CellAmount>veDEUS #{nftId}</CellAmount>
            </NFTWrap>
          </RowCenter>
        </Cell>

        <Cell>
          <Name>Vest Amount</Name>
          <Value>{formatAmount(parseFloat(deusAmount), 8)} DEUS</Value>
        </Cell>

        <Cell>
          <Name>Vest Value</Name>
          <Value>{formatAmount(parseFloat(veDEUSAmount), 6)} veDEUS</Value>
        </Cell>

        <Cell style={{ padding: '5px 10px' }}>{getExpirationCell()}</Cell>

        <Cell style={{ padding: '5px 10px' }}>{getClaimWithdrawCell()}</Cell>

        <Cell style={{ padding: '5px 10px' }}>
          <PrimaryButtonWhite disabled onClick={() => toggleLockManager(nftId)}>
            <ButtonText>Update Lock</ButtonText>
          </PrimaryButtonWhite>
        </Cell>
      </>
    )
  }

  function getTableRowMobile() {
    return (
      <MobileWrapper>
        <FirstRow>
          <RowCenter>
            <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
            <NFTWrap>
              <CellAmount>veDEUS #{nftId}</CellAmount>
            </NFTWrap>
          </RowCenter>

          <RowCenter style={{ padding: '5px 10px' }}>{getClaimWithdrawCell()}</RowCenter>

          <RowCenter style={{ padding: '5px 10px' }}>
            <PrimaryButtonWhite disabled onClick={() => toggleLockManager(nftId)}>
              <ButtonText>Update Lock</ButtonText>
            </PrimaryButtonWhite>
          </RowCenter>
        </FirstRow>

        <MobileCell>
          <Name>Vest Amount</Name>
          <Value>{formatAmount(parseFloat(deusAmount), 8)} DEUS</Value>
        </MobileCell>

        <MobileCell>
          <Name>Vest Value</Name>
          <Value>{formatAmount(parseFloat(veDEUSAmount), 6)} veDEUS</Value>
        </MobileCell>

        <MobileCell>{getExpirationCell()}</MobileCell>
      </MobileWrapper>
    )
  }

  return <ZebraStripesRow isEven={index % 2 === 0}>{isMobile ? getTableRowMobile() : getTableRow()}</ZebraStripesRow>
}
