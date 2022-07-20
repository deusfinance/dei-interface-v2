import { AbstractConnector } from '@web3-react/abstract-connector'

import { injected, walletconnect, walletlink } from '../connectors'

interface WalletInfo {
  readonly connector?: AbstractConnector
  readonly name: string
  readonly iconURL: StaticImageData
  readonly description: string
  readonly color: string
  readonly href?: string
  readonly primary?: true
  readonly mobile?: true
  readonly mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconURL: require('/public/static/images/wallets/injected.svg'),
    description: 'Injected web3 provider.',
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconURL: require('/public/static/images/wallets/metamask.png'),
    description: 'Easy-to-use browser extension.',
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconURL: require('/public/static/images/wallets/walletConnect.png'),
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    color: '#4196FC',
    mobile: true,
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconURL: require('/public/static/images/wallets/coinbaseWalletIcon.png'),
    description: 'Use Coinbase Wallet app on mobile device',
    color: '#315CF5',
  },
}
