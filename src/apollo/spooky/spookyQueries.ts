import gql from 'graphql-tag'

export const GetSpookyPoolsData = gql`
  query GetSpookyPoolsData($id: String!) {
    pairs(where: { id: $id }) {
      name
      reserveUSD
    }
  }
`

// export const GetPairsDailyData = gql`
//   query GetPairsDailyData {
//     pairDayDatas(
//       first: 8
//       where: { pairAddress: "0xaf918ef5b9f33231764a5557881e6d3e5277d456" }
//       orderBy: date
//       orderDirection: desc
//     ) {
//       pairAddress
//       dailyVolumeUSD
//     }
//   }
// `
