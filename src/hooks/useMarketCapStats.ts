import { formatUnits } from '@ethersproject/units'
import { useEffect, useState } from 'react'
import { makeHttpRequest } from 'utils/http'
import { toBN } from 'utils/numbers'

const DEUS_MARKETCAP_API = 'https://info.deus.finance/info/getMarketCap'

export default function useDeusMarketCapStats(): {
  deusPrice: number
  deusCirculatingSupply: number
  deusTotalSupply: number
  deusMarketCap: number
  xDeusPrice: number
  xDeusCirculatingSupply: number
  xDeusMarketCap: number
  combinedSupply: number
  combinedMarketCap: number
  combinedProjectedSupply: number
  inflationRate: number
} {
  const [deusPrice, setDeusPrice] = useState(0)
  const [deusCirculatingSupply, setDeusCirculatingSupply] = useState(0)
  const [deusTotalSupply, setDeusTotalSupply] = useState(0)
  const [deusMarketCap, setDeusMarketCap] = useState(0)
  const [xDeusPrice, setXDeusPrice] = useState(0)
  const [xDeusCirculatingSupply, setXDeusCirculatingSupply] = useState(0)
  const [xDeusMarketCap, setXDeusMarketCap] = useState(0)
  const [combinedSupply, setCombinedSupply] = useState(0)
  const [combinedMarketCap, setCombinedMarketCap] = useState(0)
  const [combinedProjectedSupply, setCombinedProjectedSupply] = useState(0)
  const [inflationRate, setInflationRate] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const response = await makeHttpRequest(DEUS_MARKETCAP_API)
      setDeusPrice(parseFloat(response.price.deus))
      setDeusCirculatingSupply(toBN(formatUnits(response.result.deus.total.circulatingSupply, 18)).toNumber())
      setDeusTotalSupply(toBN(formatUnits(response.result.deus.total.totalSupply, 18)).toNumber())
      setDeusMarketCap(parseFloat(response.result.deus.total.marketCap))
      setXDeusPrice(parseFloat(response.price.xdeus))
      setXDeusCirculatingSupply(toBN(formatUnits(response.result.xdeus.total.circulatingSupply, 18)).toNumber())
      setXDeusMarketCap(parseFloat(response.result.xdeus.total.marketCap))
      setCombinedSupply(
        toBN(formatUnits(response.result.deus.total.circulatingSupply, 18)).toNumber() +
          toBN(formatUnits(response.result.xdeus.total.circulatingSupply, 18)).toNumber()
      )
      setCombinedMarketCap(
        parseFloat(response.result.deus.total.marketCap) + parseFloat(response.result.xdeus.total.marketCap)
      )
      setCombinedProjectedSupply(
        (toBN(formatUnits(response.result.deus.total.circulatingSupply, 18)).toNumber() +
          toBN(formatUnits(response.result.xdeus.total.circulatingSupply, 18)).toNumber()) *
          1.2567
      )
      setInflationRate(25.67)
    }
    fetchStats()
  }, [])

  return {
    deusPrice,
    deusCirculatingSupply,
    deusTotalSupply,
    deusMarketCap,
    xDeusPrice,
    xDeusCirculatingSupply,
    xDeusMarketCap,
    combinedSupply,
    combinedMarketCap,
    combinedProjectedSupply,
    inflationRate,
  }
}
