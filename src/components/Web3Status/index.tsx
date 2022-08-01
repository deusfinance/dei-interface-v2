import React, { useMemo } from 'react'
import styled from 'styled-components'
import { UnsupportedChainIdError } from '@web3-react/core'

import useWeb3React from 'hooks/useWeb3'
import { useWalletModalToggle } from 'state/application/hooks'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { truncateAddress } from 'utils/account'

import WalletModal from 'components/WalletModal'
import { NavButton } from 'components/Button'
import { Connected as ConnectedIcon } from 'components/Icons'
import { FALLBACK_CHAIN_ID, SolidlyChains } from 'constants/chains'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { RowCenter } from 'components/Row'

const ConnectButtonWrap = styled.div`
  border: none;
  background: ${({ theme }) => theme.specialBG1};
  padding: 1px;
  border-radius: 8px;
  width: 148px;
  height: 36px;

  &:hover,
  &:focus {
    border: none;
    cursor: pointer;
  }
`

const ConnectButton = styled(RowCenter)`
  border-radius: 8px;
  background: ${({ theme }) => theme.bg2};
  height: 100%;
  width: 100%;
  white-space: nowrap;
`

const ConnectButtonText = styled.span`
  background: -webkit-linear-gradient(0deg, #e29d52 -10.26%, #de4a7b 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const ConnectedButton = styled(NavButton)`
  & > * {
    &:first-child {
      margin-right: 5px;
    }
  }
`

const ErrorButton = styled(NavButton)`
  background: ${({ theme }) => theme.red1};
  border-color: ${({ theme }) => theme.text1};
  color: white;

  &:hover,
  &:focus {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.text1};
  }
`

const Text = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
`

// We want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

function Web3StatusInner() {
  const { chainId, account, error } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  const showCallbackError: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return !SolidlyChains.includes(chainId)
  }, [chainId, account])

  if (showCallbackError) {
    return (
      <ErrorButton onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
        <Text>Wrong Network</Text>
      </ErrorButton>
    )
  } else if (account) {
    return (
      <ConnectedButton onClick={toggleWalletModal}>
        <ConnectedIcon />
        <Text>{truncateAddress(account)}</Text>
      </ConnectedButton>
    )
  } else if (error) {
    return (
      <ErrorButton onClick={toggleWalletModal}>
        <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
      </ErrorButton>
    )
  } else {
    return (
      <ConnectButtonWrap onClick={toggleWalletModal}>
        <ConnectButton>
          <ConnectButtonText>Connect Wallet</ConnectButtonText>
        </ConnectButton>
      </ConnectButtonWrap>
    )
  }
}

export default function Web3Status() {
  const { account } = useWeb3React()
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs
      .filter(isTransactionRecent)
      .sort(newTransactionsFirst)
      .filter((tx) => tx.from == account)
  }, [allTransactions, account])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  return (
    <>
      <Web3StatusInner />
      <WalletModal pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
