import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache } from '@apollo/client'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient: ApolloClient<any>

const userMiddleware = new ApolloLink((operation, forward) => {
  // add the user address to the headers
  operation.setContext(({ headers = {} }) => {
    return {
      headers: {
        ...headers,
        AccountAddress: '',
      },
    }
  })

  return forward(operation)
})

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: concat(userMiddleware, new HttpLink({ uri: 'https://backend-v2.beets-ftm-node.com/' })),
    cache: new InMemoryCache(),
    queryDeduplication: true,
  })
}

export function initializeApolloClient() {
  const _apolloClient = apolloClient ?? createApolloClient()
  return _apolloClient
}
