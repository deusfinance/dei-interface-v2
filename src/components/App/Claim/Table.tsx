import React, { useState, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import { useLPData } from 'hooks/useLPData'
import { useUserPoolData } from 'hooks/usePoolData'
import { useGeneralLenderContract, useReimburseContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'
import { useReimburse } from 'hooks/useReimburse'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { formatAmount } from 'utils/numbers'
import { ReimbursePool } from 'constants/borrow'

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

const Cel = styled.td<{
  justify?: boolean
}>`
  text-align: center;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.border1};
  height: 90px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    :nth-child(2) {
      display: none;
    }
  `}
`

export default function Table({ options }: { options: BorrowPool[] }) {
  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Your Rewards</Cel>
            <Cel>Claim Rewards</Cel>
          </tr>
        </Head>
        <tbody>
          {options.length && options.map((pool: BorrowPool, index) => <TableRowWrap key={index} pool={pool} />)}
          <TableRowReimburseWrap pool={ReimbursePool as unknown as BorrowPool} />
        </tbody>
      </TableWrapper>
    </Wrapper>
  )
}

function TableRowReimburseWrap({ pool }: { pool: BorrowPool }) {
  const { userHolder } = useReimburse()
  const reimburseContract = useReimburseContract()
  return <TableRow pool={pool} userHolder={userHolder} contract={reimburseContract} />
}

function TableRowWrap({ pool }: { pool: BorrowPool }) {
  const { userHolder } = useUserPoolData(pool)
  const generalLender = useGeneralLenderContract(pool)
  return <TableRow pool={pool} userHolder={userHolder} contract={generalLender} />
}

function TableRow({ pool, userHolder, contract }: { pool: BorrowPool; userHolder: string; contract: Contract | null }) {
  const { account } = useWeb3React()
  const { balance0, balance1 } = useLPData(pool, userHolder)

  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState(false)

  const onClaim = useCallback(async () => {
    try {
      if (!contract || !account) return
      setAwaitingClaimConfirmation(true)
      await contract.claimAndWithdraw([pool.lpPool], account)
      setAwaitingClaimConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimConfirmation(false)
    }
  }, [contract, pool, account])

  function getClaimButton() {
    if (awaitingClaimConfirmation) {
      return (
        <PrimaryButton active>
          Awaiting <DotFlashing style={{ marginLeft: '10px' }} />
        </PrimaryButton>
      )
    }
    return <PrimaryButton onClick={onClaim}>Claim</PrimaryButton>
  }

  if (parseFloat(balance0) == 0 && parseFloat(balance1) == 0) return <></>

  return (
    <Row>
      <Cel>
        {formatAmount(parseFloat(balance0))} SOLID <br />
        {formatAmount(parseFloat(balance1))} SEX
      </Cel>
      <Cel style={{ padding: '15px 30px' }}>{getClaimButton()}</Cel>
    </Row>
  )
}
