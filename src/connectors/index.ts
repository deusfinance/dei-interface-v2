import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

import { NetworkConnector } from './NetworkConnector'

import { getLibrary } from 'utils/library'

import { FALLBACK_CHAIN_ID, NETWORK_URLS, SUPPORTED_CHAIN_IDS } from 'constants/chains'

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(network.provider))
}

export const network = new NetworkConnector({
  urls: NETWORK_URLS,
  defaultChainId: FALLBACK_CHAIN_ID,
})

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
})

export const walletconnect = new WalletConnectConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
  rpc: NETWORK_URLS,
  qrcode: true,
})

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URLS[FALLBACK_CHAIN_ID],
  appName: 'DEI Finance',
  appLogoUrl: require('/public/static/images/AppLogo.png'),
  supportedChainIds: SUPPORTED_CHAIN_IDS,
})
