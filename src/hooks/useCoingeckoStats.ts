import { useState } from 'react'
import CoinGecko from 'coingecko-api'

import { CoingeckoQueue } from 'utils/queue'
import { ChartData } from 'apollo/queries'
const CoinGeckoClient = new CoinGecko()

export const SymbolIdentifiers: {
  [x: string]: string
} = {
  DEI: 'dei-token',
  DEUS: 'deus-finance-2',
}

export function useDeusPriceData() {
  return useCoingeckoPriceData(SymbolIdentifiers.DEUS, [])
}

// TODO add this to global state, so we don't refetch prices.
export default function useCoingeckoPriceData(id: string, DEFAULT_PRICE_DATA: ChartData[], forceRevert?: boolean): [] {
  const [priceData, setPriceData] = useState(DEFAULT_PRICE_DATA)

  CoingeckoQueue.add(async () => {
    try {
      const result = await CoinGeckoClient.coins.fetchMarketChartRange(id, {
        vs_currency: 'usd',
        from: 1671354550,
        to: 1671455937,
      })

      const chartdata = result?.data?.prices.map((item: any[]) => ({
        timestamp: item[0],
        value: item[1],
      }))

      console.log('chartdata', chartdata)
      console.log('result from cg api', result.data.prices)
      return chartdata
    } catch (err) {
      console.log('Unable to fetch Coingecko price data:')
      console.error(err)
      return []
    }
  })
  return []
}
