import { useEffect, useState } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { isMobile } from 'react-device-detect'

import { injected } from '../connectors'
import { useInjectedAddress } from './useInjectedAddress'

import { FALLBACK_CHAIN_ID, SupportedChainId, ActiveChains } from 'constants/chains'
import { NETWORK_CONTEXT_NAME } from 'constants/misc'

export default function useWeb3React(): Web3ReactContextInterface<Web3Provider> & {
  chainId?: SupportedChainId
} {
  const context = useWeb3ReactCore<Web3Provider>()
  const injectedAddress = useInjectedAddress()
  const injectedContext = injectedAddress ? { ...context, account: injectedAddress } : context
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NETWORK_CONTEXT_NAME)
  return context.active ? injectedContext : contextNetwork
}

export function UseDefaultWeb3React(): SupportedChainId {
  const { chainId } = useWeb3React()
  return chainId && ActiveChains.includes(chainId) ? chainId : FALLBACK_CHAIN_ID
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore()

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && ethereum.removeAllListeners && !active && !error && !suppress) {
      const handleChainChanged = () => {
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
