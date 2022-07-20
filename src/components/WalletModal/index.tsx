import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { UnsupportedChainIdError } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'

import useWeb3React from 'hooks/useWeb3'
import usePrevious from 'hooks/usePrevious'

import { useModalOpen, useWalletModalToggle } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

import { injected } from '../../connectors'
import { SUPPORTED_WALLETS } from 'constants/wallet'

import Option from './Option'
import PendingView from './PendingView'
import { Modal, ModalHeader } from 'components/Modal'
import AccountDetails from 'components/AccountDetails'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 0.8rem;
`

enum WALLET_VIEWS {
  ACCOUNT = 'account',
  OPTIONS = 'options',
  PENDING = 'pending',
}

export default function WalletModal({
  pendingTransactions,
  confirmedTransactions,
}: {
  pendingTransactions: string[] // hashes of pending
  confirmedTransactions: string[] // hashes of confirmed
}) {
  const { active, account, connector, activate, error } = useWeb3React()
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<boolean>(false)

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return SUPPORTED_WALLETS[key].name
      }
      return true
    })
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector) {
      connector.walletConnectProvider = undefined
    }

    if (connector) {
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector) // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true)
        }
      })
    }
  }

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key]
      // check for mobile options
      if (isMobile) {
        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.iconURL}
            />
          )
        }
        return null
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon={require('/public/static/images/wallets/metamask.png')}
              />
            )
          } else {
            return null //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.description to bring back multi-line
            icon={option.iconURL}
          />
        )
      )
    })
  }

  function getModalContent() {
    if (error) {
      return (
        <>
          <ModalHeader
            title={error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}
            onClose={toggleWalletModal}
          />
          <Wrapper>
            {error instanceof UnsupportedChainIdError ? (
              <div>Please connect to the Fantom network.</div>
            ) : (
              <div>Error connecting. Try refreshing the page.</div>
            )}
          </Wrapper>
        </>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <>
          <ModalHeader title={'Account'} onClose={toggleWalletModal} />
          <AccountDetails
            pendingTransactions={pendingTransactions}
            confirmedTransactions={confirmedTransactions}
            openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
          />
        </>
      )
    }

    return (
      <>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <ModalHeader
            onBack={() => {
              setPendingError(false)
              setWalletView(WALLET_VIEWS.ACCOUNT)
            }}
            border={true}
            onClose={toggleWalletModal}
          />
        ) : (
          <ModalHeader title={'Connect a wallet'} onClose={toggleWalletModal} />
        )}
        <Wrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
        </Wrapper>
      </>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onBackgroundClick={toggleWalletModal} onEscapeKeydown={toggleWalletModal}>
      {getModalContent()}
    </Modal>
  )
}
