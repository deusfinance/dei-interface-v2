import gql from 'graphql-tag'

export const GetBeetsPoolData = gql`
  query GetBeetsPoolData($id: String!) {
    poolGetPool(id: $id) {
      dynamicData {
        totalLiquidity
        apr {
          total
        }
      }
    }
  }
`
