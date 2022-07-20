import { SupportedChainId } from 'constants/chains'
import { createApolloClient } from './index'

const fantomClient = createApolloClient(`https://api.thegraph.com/subgraphs/name/${getSubgraphName(250)}`)

export function getApolloClient(chainId: SupportedChainId) {
  switch (chainId) {
    case SupportedChainId.FANTOM:
      return fantomClient
    default:
      console.error(`${chainId} is not a supported subgraph network`)
      return null
  }
}

export function getSubgraphName(chainId: SupportedChainId) {
  switch (chainId) {
    case SupportedChainId.FANTOM:
      return 'mmd-mostafaee/tranche-subgraph'
    default:
      console.error(`${chainId} is not a supported subgraph network`)
      return null
  }
}
