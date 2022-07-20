import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import toast from 'react-hot-toast'

import { formatAmount } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'

import { useVeDistContract } from 'hooks/useContract'
import { useIsTransactionPending, useTransactionAdder } from 'state/transactions/hooks'
import { useVestedInformation } from 'hooks/useVested'

import DEUS_LOGO from '/public/static/images/tokens/deus.svg'

import Pagination from 'components/Pagination'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'

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
    :nth-child(2),
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
export default function Table({ nftIds, rewards }: { nftIds: number[]; rewards: number[] }) {
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
              <Cell>Earned</Cell>
              <Cell>Actions</Cell>
            </tr>
          </Head>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((nftId: number, index) => (
                <TableRow key={index} nftId={nftId} reward={rewards[index] ?? 0} />
              ))}
          </tbody>
        </TableWrapper>
        {paginatedItems.length == 0 && <NoResults>No Results Found</NoResults>}
        {paginatedItems.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
      </Wrapper>
    </>
  )
}

function TableRow({ nftId, reward }: { nftId: number; reward: number }) {
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingTxHash, setPendingTxHash] = useState('')
  const { deusAmount, veDEUSAmount, lockEnd } = useVestedInformation(nftId)
  const veDistContract = useVeDistContract()
  const addTransaction = useTransactionAdder()
  const showTransactionPending = useIsTransactionPending(pendingTxHash)

  const lockHasEnded = useMemo(() => dayjs.utc(lockEnd).isBefore(dayjs.utc().subtract(10, 'seconds')), [lockEnd]) // subtracting 10 seconds to mitigate this from being true on page load

  const onClaim = useCallback(async () => {
    try {
      if (!veDistContract) return
      setAwaitingConfirmation(true)
      const response = await veDistContract.claim(nftId)
      addTransaction(response, { summary: `Claim #${nftId} reward`, vest: { hash: response.hash } })
      setPendingTxHash(response.hash)
      setAwaitingConfirmation(false)
    } catch (err) {
      console.log(DefaultHandlerError(err))
      setAwaitingConfirmation(false)
      setPendingTxHash('')
      if (err?.code === 4001) {
        toast.error('Transaction rejected.')
      } else toast.error(DefaultHandlerError(err))
    }
  }, [veDistContract, nftId, addTransaction])

  function getExpirationCell() {
    if (!lockHasEnded) {
      return (
        <CellWrap>
          <CellAmount>{dayjs.utc(lockEnd).format('LLL')}</CellAmount>
          <CellDescription>Expires in {dayjs.utc(lockEnd).fromNow(true)}</CellDescription>
        </CellWrap>
      )
    }
    return (
      <CellWrap>
        <CellAmount>Ended</CellAmount>
      </CellWrap>
    )
  }

  function getActionButton() {
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
          Claiming <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    if (reward == 0) {
      return <PrimaryButton disabled>Claim</PrimaryButton>
    }
    return <PrimaryButton onClick={onClaim}>Claim</PrimaryButton>
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
      <Cell>
        <CellRow>{formatAmount(reward, 3)} veDEUS</CellRow>
      </Cell>
      <Cell style={{ padding: '5px 10px' }}>{getActionButton()}</Cell>
    </Row>
  )
}
