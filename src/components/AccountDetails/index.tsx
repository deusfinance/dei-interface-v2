import { useCallback } from 'react'
import styled from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { useAppDispatch } from 'state'
import { injected, walletlink } from '../../connectors'
import { SUPPORTED_WALLETS } from 'constants/wallet'
import { ExplorerDataType } from 'utils/explorers'
import { truncateAddress } from 'utils/account'
import { clearAllTransactions } from 'state/transactions/actions'

import { Connected as ConnectedIcon, Link } from 'components/Icons'
import { ExplorerLink } from 'components/Link'
import Copy from 'components/Copy'
import Transaction from './Transaction'
import { RowEnd } from 'components/Row'
import { darken } from 'polished'

const AccountWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  position: relative;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 10px;
  padding: 12px 21px;
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

const Connected = styled.button`
  background: ${({ theme }) => theme.specialBG1};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `};
`

const ActionButton = styled.button<{
  hide?: boolean
  disable?: boolean
}>`
  background: ${({ theme }) => theme.bg1};
  border-radius: 4px;
  outline: none;
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  text-align: center;
  color: white;
  width: 61px;
  height: 24px;

  &:hover {
    background: ${({ theme }) => theme.bg3};
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
  font-family: 'Inter';
  font-size: 12px;

  color: ${({ theme }) => theme.text2};
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
  font-family: 'Inter';
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 10px;
  font-weight: 500;
  font-size: 12px;

  color: ${({ theme }) => theme.text1};

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.text1)};
    cursor: pointer;
  }
`

const TransactionsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text3};
  /* padding: 1.5rem; */
  padding: 40px 4px;

  overflow: scroll;
  gap: 5px;

  & > * {
    &:first-child {
      display: flex;
      flex-flow: row nowrap;
      justify-content: center;
      font-size: 0.8rem;
      margin-bottom: 8px;
      padding: 40px auto;
    }
    &:not(:first-child) {
      max-height: 200px;
    }
  }
`

const AllTransactions = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text3};
  padding: 11px 24px;

  overflow: scroll;
  gap: 4px;

  & > * {
    &:first-child {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 8px;
      align-items: baseline;
    }
    &:not(:first-child) {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 200px;
      margin-bottom: 12px;
    }
  }
`

const RecentTransactions = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
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
          {account && <Copy toCopy={account} text={''} />}
          {chainId && account && (
            <RowEnd>
              <ExplorerLink type={ExplorerDataType.ADDRESS} chainId={chainId} value={account}>
                <AddressLink>
                  View on Explorer
                  <Link style={{ transform: 'translateY(1px)' }} />
                </AddressLink>
              </ExplorerLink>
            </RowEnd>
          )}
        </MiddleRow>
        <BottomRow></BottomRow>
      </AccountWrapper>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <AllTransactions>
          <div>
            <RecentTransactions>Recent Transactions</RecentTransactions>
            <ClearButton onClick={clearAllTransactionsCallback}>Clear All</ClearButton>
          </div>
          <div>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </div>
        </AllTransactions>
      ) : (
        <TransactionsWrapper>
          <div>Your transactions will appear here...</div>
        </TransactionsWrapper>
      )}
    </>
  )
}
