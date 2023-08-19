import { SupportedChainId } from 'constants/chains'
import { createApolloClient } from './index'

const ArbClient = createApolloClient(
  `https://api.thegraph.com/subgraphs/name/${getSubgraphName(SupportedChainId.ARBITRUM)}`
)

export function getTotalPaymentApolloClient(chainId: SupportedChainId) {
  switch (chainId) {
    case SupportedChainId.ARBITRUM:
      return ArbClient
    default:
      console.error(`${chainId} is not a supported subgraph network`)
      return null
  }
}

export function getSubgraphName(chainId: SupportedChainId) {
  switch (chainId) {
    case SupportedChainId.ARBITRUM:
      return 'navid-fkh/reimbursewatcher'
    default:
      console.error(`${chainId} is not a supported subgraph network`)
      return null
  }
}
