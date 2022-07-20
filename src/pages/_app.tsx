import { Provider as ReduxProvider } from 'react-redux'
import { Web3ReactProvider } from '@web3-react/core'
import { ModalProvider } from 'styled-react-modal'
import dynamic from 'next/dynamic'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

import Web3ReactManager from '../components/Web3ReactManager'
import ThemeProvider, { ThemedGlobalStyle } from '../theme'
import Popups from '../components/Popups'
import Layout from '../components/Layout'
import { ModalBackground } from '../components/Modal'

import store from '../state'
import { getLibrary } from '../utils/library'

const Updaters = dynamic(() => import('../state/updaters'), { ssr: false })
const Web3ProviderNetwork = dynamic(() => import('../components/Web3ProviderNetwork'), {
  ssr: false,
})

if (typeof window !== 'undefined' && !!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider store={store}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <Web3ReactManager>
            <ThemeProvider>
              <ThemedGlobalStyle />
              <ModalProvider backgroundComponent={ModalBackground}>
                <Toaster position="bottom-center" />
                <Popups />
                <Updaters />
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ModalProvider>
            </ThemeProvider>
          </Web3ReactManager>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </ReduxProvider>
  )
}
