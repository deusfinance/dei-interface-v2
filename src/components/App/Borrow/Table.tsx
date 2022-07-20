import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useCurrenciesFromPool } from 'state/borrow/hooks'
import { BorrowPool, LenderVersion } from 'state/borrow/reducer'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { useGlobalPoolData, useUserPoolData } from 'hooks/usePoolData'
import { useLPData } from 'hooks/useLPData'

import Pagination from 'components/Pagination'
import { PrimaryButton } from 'components/Button'
import { DualImageWrapper } from 'components/DualImage'
import ImageWithFallback from 'components/ImageWithFallback'
import { formatAmount } from 'utils/numbers'

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
  line-height: 0.8rem;
  color: ${({ theme }) => theme.text1};
`

const Deprecated = styled.div`
  color: ${({ theme }) => theme.text3};
  margin: auto;
  margin-top: 10px;
`

const Cel = styled.td<{
  justify?: boolean
}>`
  text-align: center;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    :nth-child(3),
    :nth-child(4) {
      display: none;
    }
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    :nth-child(2) {
      display: none;
    }
  `}
`

const itemsPerPage = 10
export default function Table({
  options,
  onMintClick,
}: {
  options: BorrowPool[]
  onMintClick: (contract: string, version: LenderVersion) => void
}) {
  const [offset, setOffset] = useState(0)

  const paginatedOptions = useMemo(() => {
    return options.slice(offset, offset + itemsPerPage)
  }, [options, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(options.length / itemsPerPage)
  }, [options])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Composition</Cel>
            <Cel>Type</Cel>
            <Cel>Total Borrowed</Cel>
            <Cel>Your Rewards</Cel>
            <Cel>Action</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((pool: BorrowPool, index) => (
              <TableRow key={index} pool={pool} onMintClick={onMintClick} />
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                No Results Found
              </td>
            </tr>
          )}
        </tbody>
      </TableWrapper>
      {paginatedOptions.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
    </Wrapper>
  )
}

function TableRow({
  pool,
  onMintClick,
}: {
  pool: BorrowPool
  onMintClick: (contract: string, version: LenderVersion) => void
}) {
  const { borrowCurrency } = useCurrenciesFromPool(pool ?? undefined)
  const logoOne = useCurrencyLogo(pool.token0.address)
  const logoTwo = useCurrencyLogo(pool.token1.address)
  const { userHolder } = useUserPoolData(pool)
  const { balance0, balance1 } = useLPData(pool, userHolder)
  const { borrowedElastic } = useGlobalPoolData(pool)

  return (
    <Row>
      <Cel>
        <DualImageWrapper>
          <ImageWithFallback src={logoOne} alt={`${pool.token0.symbol} logo`} width={30} height={30} />
          <ImageWithFallback src={logoTwo} alt={`${pool.token1.symbol} logo`} width={30} height={30} />
          {pool.composition}
        </DualImageWrapper>
        {pool.version == LenderVersion.V1 && <Deprecated>(deprecated)</Deprecated>}
      </Cel>
      <Cel>{pool.type}</Cel>
      <Cel>
        {formatAmount(parseFloat(borrowedElastic))} {borrowCurrency?.symbol}
      </Cel>
      <Cel>
        {formatAmount(parseFloat(balance0))} SOLID <br />
        {formatAmount(parseFloat(balance1))} SEX
      </Cel>
      <Cel style={{ padding: '5px 10px' }}>
        <PrimaryButton onClick={() => onMintClick(pool.contract.address, pool.version)}>Repay</PrimaryButton>
      </Cel>
    </Row>
  )
}
