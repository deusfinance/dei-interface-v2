import { useEffect, useState } from 'react'

type TUsePrice = Record<'from' | 'to' | 'amount' | 'slippage' | 'chainId' | 'saveGas' | 'gasInclude', string>

export const useFirebirdPrice = ({ from, to, amount, slippage, chainId, saveGas, gasInclude }: TUsePrice) => {
  const dexes =
    'basedfinance,beethovenx,bombswap,curve,knightswap,deusstable,equalizer,excalibur,firebird,fraxswap,fusd,jetswap,morpheusswap,mummy,paintswap,protofi,saddle,solidly,soulswap,spartacus,spiritswap,spiritswapv2,spookyswap,sushiswap,synapse,tombswap,wigoswap,woofi,woofiv2,yoshiexchange'

  const [price, setPrice] = useState<string>()

  useEffect(() => {
    const handleSwapRequest = async () => {
      const response = await fetch(
        `https://router.firebird.finance/fantom/route?amount=${amount}&dexes=${dexes}&slippage=${slippage}&from=${from}&to=${to}&chainId=${chainId}&saveGas=${saveGas}&gasInclude=${gasInclude}&source=firebird&compareDexes=spookyswap`
      )
      const responseJson = await response.json()
      setPrice(responseJson?.maxReturn?.totalTo)
    }
    handleSwapRequest()
  }, [])

  return price
}
