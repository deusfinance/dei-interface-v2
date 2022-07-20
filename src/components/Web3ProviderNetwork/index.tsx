import { createWeb3ReactRoot } from '@web3-react/core'

import { NETWORK_CONTEXT_NAME } from 'constants/misc'

const Web3ReactProviderDefault = createWeb3ReactRoot(NETWORK_CONTEXT_NAME)

export default function Web3ReactProviderDefaultSSR({
  children,
  getLibrary,
}: {
  children: React.ReactNode
  getLibrary: (provider: any) => void
}) {
  return <Web3ReactProviderDefault getLibrary={getLibrary}>{children}</Web3ReactProviderDefault>
}
