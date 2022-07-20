import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

import { useVeDeusContract } from 'hooks/useContract'
import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
import { useVestedInformation, useVestedAPY } from 'hooks/useVested'

import Pagination from 'components/Pagination'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'

import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import { formatAmount } from 'utils/numbers'

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
`

const Head = styled.thead`
  & > tr {
    height: 56px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => theme.bg0};
  }
`

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const Cell = styled.td<{
  justify?: boolean
}>`
  text-align: center;
  align-items: center;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    :nth-child(3),
    :nth-child(4) {
      display: none;
    }
  `}
`

const NoResults = styled.div`
  text-align: center;
  padding: 20px;
`

const NFTWrap = styled(Column)`
  margin-left: 10px;
  align-items: flex-start;
`

const CellWrap = styled(Column)`
  gap: 5px;
`

const CellRow = styled(RowCenter)`
  gap: 5px;
`

const CellAmount = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const CellDescription = styled.div`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text2};
`

const itemsPerPage = 10
export default function Table({
  nftIds,
  toggleLockManager,
  toggleAPYManager,
}: {
  nftIds: number[]
  toggleLockManager: (nftId: number) => void
  toggleAPYManager: (nftId: number) => void
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
          <Head>
            <tr>
              <Cell>Token ID</Cell>
              <Cell>Vest Amount</Cell>
              <Cell>Vest Value</Cell>
              <Cell>Vest Expiration</Cell>
              {/* <Cell>APR</Cell> */}
              <Cell>Actions</Cell>
            </tr>
          </Head>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((nftId: number, index) => (
                <TableRow
                  key={index}
                  nftId={nftId}
                  toggleLockManager={toggleLockManager}
                  toggleAPYManager={toggleAPYManager}
                />
              ))}
          </tbody>
        </TableWrapper>
        {paginatedItems.length == 0 && <NoResults>No Results Found</NoResults>}
        {paginatedItems.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
      </Wrapper>
    </>
  )
}

function TableRow({
  nftId,
  toggleLockManager,
  toggleAPYManager,
}: {
  nftId: number
  toggleLockManager: (nftId: number) => void
  toggleAPYManager: (nftId: number) => void
}) {
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const { deusAmount, veDEUSAmount, lockEnd } = useVestedInformation(nftId)
  const { userAPY } = useVestedAPY(nftId)
  const veDEUSContract = useVeDeusContract()
  const addTransaction = useTransactionAdder()
  const showTransactionPending = useHasPendingVest(pendingTxHash)

  const lockHasEnded = useMemo(() => dayjs.utc(lockEnd).isBefore(dayjs.utc().subtract(10, 'seconds')), [lockEnd]) // subtracting 10 seconds to mitigate this from being true on page load

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
    if (!lockHasEnded) {
      return (
        <CellWrap>
          <CellAmount>{dayjs.utc(lockEnd).format('LLL')}</CellAmount>
          <CellDescription>Expires in {dayjs.utc(lockEnd).fromNow(true)}</CellDescription>
        </CellWrap>
      )
    }
    if (awaitingConfirmation) {
      return (
        <PrimaryButton active>
          Confirming <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (showTransactionPending) {
      return (
        <PrimaryButton active>
          Withdrawing <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    return <PrimaryButton onClick={onWithdraw}>Withdraw</PrimaryButton>
  }

  return (
    <Row>
      <Cell>
        <RowCenter>
          <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
          <NFTWrap>
            <CellAmount>#{nftId}</CellAmount>
            <CellDescription>veDEUS ID</CellDescription>
          </NFTWrap>
        </RowCenter>
      </Cell>
      <Cell>{deusAmount} DEUS</Cell>
      <Cell>{formatAmount(parseFloat(veDEUSAmount))} veDEUS</Cell>
      <Cell style={{ padding: '5px 10px' }}>{getExpirationCell()}</Cell>
      {/* <Cell>
        <CellRow>
          {formatAmount(parseFloat(userAPY), 0)}%
          <Info onClick={() => toggleAPYManager(nftId)} />
        </CellRow>
      </Cell> */}
      <Cell style={{ padding: '5px 10px' }}>
        <PrimaryButton onClick={() => toggleLockManager(nftId)}>Update Lock</PrimaryButton>
      </Cell>
    </Row>
  )
}
