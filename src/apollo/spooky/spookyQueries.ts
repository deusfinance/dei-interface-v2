import gql from 'graphql-tag'

export const GetSpookyPoolsData = gql`
  query GetSpookyPoolsData($id: String!) {
    pairs(where: { id: $id }) {
      name
      reserveUSD
    }
  }
`
