import { createApolloClient } from './index'

export function getApolloClient() {
  return createApolloClient('https://api.thegraph.com/index-node/graphql')
}
