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
import { PrimaryButtonWhite, PrimaryButtonWide } from 'components/Button'
import { DotFlashing } from 'components/Icons'

import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import { formatAmount } from 'utils/numbers'
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
`

// const Head = styled.thead`
//   & > tr {
//     height: 56px;
//     font-size: 0.9rem;
//     color: ${({ theme }) => theme.text1};
//     background: ${({ theme }) => theme.bg0};
//   }
// `

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const Cell = styled.td<{
  justify?: boolean
}>`
  /* text-align: center; */
  align-items: center;
  padding: 5px;
  /* border: 1px solid ${({ theme }) => theme.border1}; */
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
  font-size: 0.85rem;
  background: linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const CellDescription = styled.div`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.text2};
`

const Name = styled.div`
  font-weight: 400;
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
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
          {/* <Head>
            <tr>
              <Cell>Token ID</Cell>
              <Cell>Vest Amount</Cell>
              <Cell>Vest Value</Cell>
              <Cell>Vest Expiration</Cell>
              <Cell>Actions</Cell>
            </tr>
          </Head> */}
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((nftId: number, index) => (
                <TableRow
                  key={index}
                  index={index}
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
  index,
}: {
  nftId: number
  toggleLockManager: (nftId: number) => void
  toggleAPYManager: (nftId: number) => void
  index: number
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

  function getClaimWithdrawCell() {
    const hasClaimable = true

    if (!lockHasEnded) {
      if (!hasClaimable) return null
      return (
        <PrimaryButtonWide onClick={onWithdraw}>
          <ButtonText>Claim XX</ButtonText>
        </PrimaryButtonWide>
      )
    }
    if (awaitingConfirmation) {
      return (
        <PrimaryButtonWide active>
          <ButtonText>
            Confirming <DotFlashing style={{ marginLeft: '10px' }} />
          </ButtonText>
        </PrimaryButtonWide>
      )
    }
    if (showTransactionPending) {
      return (
        <PrimaryButtonWide active>
          <ButtonText>
            Withdrawing <DotFlashing style={{ marginLeft: '10px' }} />
          </ButtonText>
        </PrimaryButtonWide>
      )
    }
    return (
      <PrimaryButtonWide onClick={onWithdraw}>
        <ButtonText>Withdraw and Claim XX</ButtonText>
      </PrimaryButtonWide>
    )
  }

  return (
    <ZebraStripesRow isEven={index % 2 === 0}>
      <Cell>
        <RowCenter>
          <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
          <NFTWrap>
            <CellAmount>veDEUS #{nftId}</CellAmount>
            {/* <CellDescription>veDEUS ID</CellDescription> */}
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
      {/* <Cell>
        <CellRow>
          {formatAmount(parseFloat(userAPY), 0)}%
          <Info onClick={() => toggleAPYManager(nftId)} />
        </CellRow>
      </Cell> */}
      <Cell style={{ padding: '5px 10px' }}>
        <PrimaryButtonWhite disabled onClick={() => toggleLockManager(nftId)}>
          <ButtonText>Update Lock</ButtonText>
        </PrimaryButtonWhite>
      </Cell>
    </ZebraStripesRow>
  )
}
