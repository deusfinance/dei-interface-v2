import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'

import { network } from '../../connectors'
import { useEagerConnect, useInactiveListener } from 'hooks/useWeb3'
import { NETWORK_CONTEXT_NAME } from 'constants/misc'

export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  const { active } = useWeb3React()
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NETWORK_CONTEXT_NAME)

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(network)
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  if (!triedEager) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!active && networkError) {
    console.log('Oops! An unknown error occurred. Please refresh the page, or visit from another browser or device.')
  }

  return children
}
