import { useCallback } from 'react'
import { ExternalLink as LinkIcon } from 'react-feather'
import styled from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { useAppDispatch } from 'state'
import { injected, walletlink } from '../../connectors'
import { SUPPORTED_WALLETS } from 'constants/wallet'
import { ExplorerDataType } from 'utils/explorers'
import { truncateAddress } from 'utils/account'
import { clearAllTransactions } from 'state/transactions/actions'

import { Connected as ConnectedIcon } from 'components/Icons'
import { ExplorerLink } from 'components/Link'
import Copy from 'components/Copy'
import Transaction from './Transaction'

const AccountWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  position: relative;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 10px;
  padding: 0.8rem;
  margin: 1.6rem 1rem;
  height: 125px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 1rem;
    height: 100px;
  `};
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: start;
  width: 100%;
`

const Connected = styled.div`
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `};
`

const ActionButton = styled.button<{
  hide?: boolean
  disable?: boolean
}>`
  background: ${({ theme }) => theme.primary1};
  border-radius: 10px;
  outline: none;
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  text-align: center;
  color: white;

  &:hover {
    background: ${({ theme }) => theme.primary2};
    cursor: pointer;
  }

  ${(props) =>
    props.disable &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}
`

const ClearButton = styled(ActionButton)`
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
`

const MiddleRow = styled(Row)`
  justify-content: flex-start;
  align-items: center;
  color: ${({ theme }) => theme.text1};
  gap: 5px;
  font-size: 1rem;
`

const BottomRow = styled(Row)`
  justify-content: flex-start;
  align-items: center;
  color: ${({ theme }) => theme.text2};
  gap: 5px;
  font-size: 0.8rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `}
`

const AddressLink = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 10px;
`

const TransactionsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background: ${({ theme }) => theme.bg2};
  padding: 1.5rem;
  overflow: scroll;
  gap: 5px;

  & > * {
    &:first-child {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 5px;
    }
    &:not(:first-child) {
      max-height: 200px;
    }
  }
`

function renderTransactions(transactions: string[]) {
  return (
    <>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />
      })}
    </>
  )
}

interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  openOptions: () => void
}

export default function AccountDetails({
  pendingTransactions,
  confirmedTransactions,
  openOptions,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useWeb3React()
  const dispatch = useAppDispatch()

  function getConnectorName() {
    const isMetaMask = !!(window.ethereum && window.ethereum.isMetaMask)
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0]
    return <Connected>Connected with {name}</Connected>
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <>
      <AccountWrapper>
        <Row>
          {getConnectorName()}
          <div>
            {connector !== injected && connector !== walletlink && (
              <ActionButton
                onClick={() => {
                  ;(connector as any).close()
                }}
              >
                Disconnect
              </ActionButton>
            )}
            <ActionButton
              onClick={() => {
                openOptions()
              }}
            >
              Change
            </ActionButton>
          </div>
        </Row>
        <MiddleRow>
          {connector && <ConnectedIcon />}
          {account && truncateAddress(account)}
        </MiddleRow>
        <BottomRow>
          {account && <Copy toCopy={account} text={'Copy Address'} />}
          {chainId && account && (
            <ExplorerLink type={ExplorerDataType.ADDRESS} chainId={chainId} value={account}>
              <AddressLink>
                View on Explorer
                <LinkIcon size={12} style={{ transform: 'translateY(1px)' }} />
              </AddressLink>
            </ExplorerLink>
          )}
        </BottomRow>
      </AccountWrapper>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <TransactionsWrapper>
          <div>
            Recent Transactions
            <ClearButton onClick={clearAllTransactionsCallback}>clear all</ClearButton>
          </div>
          <div>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </div>
        </TransactionsWrapper>
      ) : (
        <TransactionsWrapper>
          <div>Your transactions will appear here...</div>
        </TransactionsWrapper>
      )}
    </>
  )
}
