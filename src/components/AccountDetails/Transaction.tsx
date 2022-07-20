import React from 'react'
import styled from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { useAllTransactions } from 'state/transactions/hooks'
import { ExplorerLink } from 'components/Link'
import { CheckMark, Loader } from 'components/Icons'
import { ExplorerDataType } from 'utils/explorers'

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  font-size: 0.8rem;
  margin-bottom: 1px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `};

  &:hover {
    text-decoration: underline;
  }
`

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useWeb3React()
  const allTransactions = useAllTransactions()

  const tx = allTransactions?.[hash]
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')
  const cancelled = tx?.receipt && tx.receipt.status === 1337

  if (!chainId) return null

  return (
    <ExplorerLink type={ExplorerDataType.TRANSACTION} chainId={chainId} value={hash}>
      <Row>
        <div>{summary ?? hash} ↗</div>
        {success ? (
          <CheckMark color={'green'} />
        ) : cancelled ? (
          <CheckMark color={'red'} />
        ) : (
          <Loader size={'12px'} stroke="blue" />
        )}
      </Row>
    </ExplorerLink>
  )
}
