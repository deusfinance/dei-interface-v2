import { useEffect, useState } from 'react'
import CoinGecko from 'coingecko-api'

import { CoingeckoQueue } from 'utils/queue'
const CoinGeckoClient = new CoinGecko()

export const SymbolIdentifiers: {
  [x: string]: string
} = {
  BEETS: 'beethoven-x',
  BTC: 'bitcoin',
  BOO: 'spookyswap',
  DAI: 'dai',
  DEI: 'dei-token',
  DEUS: 'deus-finance-2',
  FTM: 'fantom',
  LQDR: 'liquiddriver',
  MIM: 'magic-internet-money',
  MIMATIC: 'mimatic',
  OXD: '0xdao',
  OXSOLID: 'oxsolid',
  SCREAM: 'scream',
  SPELL: 'spell-token',
  SOLID: 'solidly',
  SOLIDsex: 'solidsex-tokenized-vesolid',
  TOMB: 'tomb',
  USDC: 'usd-coin',
  WBTC: 'bitcoin',
  WFTM: 'fantom',
}

export function useDeusPrice() {
  return useCoingeckoPrice(SymbolIdentifiers.DEUS, '0')
}
export function useDeiPrice() {
  return useCoingeckoPrice(SymbolIdentifiers.DEI, '0')
}
export function useUSDCPrice() {
  return useCoingeckoPrice(SymbolIdentifiers.USDC, '0')
}

export function useSolidPrice() {
  return useCoingeckoPrice(SymbolIdentifiers.SOLID, '0')
}

export function useCustomCoingeckoPrice(symbol: string) {
  const valid = symbol in SymbolIdentifiers
  return useCoingeckoPrice(valid ? SymbolIdentifiers[symbol] : '', '0', !valid)
}

type TUseSwap = Record<'from' | 'to' | 'amount' | 'slippage' | 'chainId' | 'saveGas' | 'gasInclude', string>
type TUseSwapResponse = {
  maxReturn: {
    totalTo: string
  }
}
export const useSwap = ({ from, to, amount, slippage, chainId, saveGas, gasInclude }: TUseSwap) => {
  const dexes =
    'basedfinance,beethovenx,bombswap,curve,knightswap,deusstable,equalizer,excalibur,firebird,fraxswap,fusd,jetswap,morpheusswap,mummy,paintswap,protofi,saddle,solidly,soulswap,spartacus,spiritswap,spiritswapv2,spookyswap,sushiswap,synapse,tombswap,wigoswap,woofi,woofiv2,yoshiexchange'
  const [price, setPrice] = useState<TUseSwapResponse>()
  useEffect(() => {
    const handleSwapRequest = async () => {
      const response = await fetch(
        `https://router.firebird.finance/fantom/route?amount=${amount}&dexes=${dexes}&slippage=${slippage}&from=${from}&to=${to}&chainId=${chainId}&saveGas=${saveGas}&gasInclude=${gasInclude}&source=firebird&compareDexes=spookyswap`
      )
      const responseJson: TUseSwapResponse = await response.json()
      setPrice(responseJson)
    }
    handleSwapRequest()
  }, [])
  return price
}

// TODO add this to global state, so we don't refetch prices.
export default function useCoingeckoPrice(id: string, DEFAULT_PRICE: string, forceRevert?: boolean): string {
  const [price, setPrice] = useState(DEFAULT_PRICE)

  useEffect(() => {
    const fetchPrice = () => {
      CoingeckoQueue.add(async () => {
        try {
          const result = await CoinGeckoClient.simple.price({
            ids: [id],
            vs_currencies: ['usd'],
          })

          const price: number = result?.data?.[id]?.usd ?? 0
          setPrice(price.toString())
        } catch (err) {
          console.log('Unable to fetch Coingecko price:')
          console.error(err)
          setPrice(DEFAULT_PRICE)
        }
      })
    }
    if (!forceRevert) {
      fetchPrice()
    }
  }, [id, forceRevert, DEFAULT_PRICE])

  return price
}
