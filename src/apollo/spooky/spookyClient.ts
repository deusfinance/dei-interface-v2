import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache } from '@apollo/client'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient: ApolloClient<any>

//Create Fura Headers
const furaHeaders = new Headers()
furaHeaders.append('sec-ch-ua', '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"')
furaHeaders.append('accept', '*/*')
furaHeaders.append('content-type', 'application/json')
furaHeaders.append('sec-ch-ua-mobile', '?0')
furaHeaders.append(
  'User-Agent',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
)
furaHeaders.append('sec-ch-ua-platform', '"Windows"')
furaHeaders.append('Sec-Fetch-Site', 'cross-site')
furaHeaders.append('Sec-Fetch-Mode', 'cors')
furaHeaders.append('Sec-Fetch-Dest', 'empty')
furaHeaders.append('Origin', 'localhost:3000')
furaHeaders.append('host', 'api.fura.org')

const userMiddleware = new ApolloLink((operation, forward) => {
  // add the user address to the headers
  operation.setContext(({ headers = {} }) => {
    return {
      headers: {
        ...furaHeaders,
      },
    }
  })

  return forward(operation)
})

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: concat(userMiddleware, new HttpLink({ uri: 'https://api.fura.org/subgraphs/name/spookyswap' })),
    cache: new InMemoryCache(),
    queryDeduplication: true,
  })
}

export function initializeSpookyApolloClient() {
  const _apolloClient = apolloClient ?? createApolloClient()
  return _apolloClient
}
