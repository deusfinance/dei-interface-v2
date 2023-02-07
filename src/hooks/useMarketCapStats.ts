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
  deusNonCirculatingSupply: number
  deusSupplyInBridges: number
  deusSupplyInVeDeusContract: number
  deusTotalSupplyOnChain: number
  xDeusPrice: number
  xDeusCirculatingSupply: number
  xDeusMarketCap: number
  xDeusNonCirculatingSupply: number
  xDeusTotalSupply: number
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
  const [deusNonCirculatingSupply, setDeusNonCirculatingSupply] = useState(0)
  const [deusSupplyInBridges, setDeusSupplyInBridges] = useState(0)
  const [deusSupplyInVeDeusContract, setDeusSupplyInVeDeusContract] = useState(0)
  const [deusTotalSupplyOnChain, setDeusTotalSupplyOnChain] = useState(0)
  const [xDeusNonCirculatingSupply, setXDeusNonCirculatingSupply] = useState(0)
  const [xDeusTotalSupply, setXDeusTotalSupply] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      const response = await makeHttpRequest(DEUS_MARKETCAP_API)
      setDeusPrice(parseFloat(response.price.deus ?? 0))
      setDeusCirculatingSupply(toBN(formatUnits(response.result.deus.total.circulatingSupply ?? 0, 18)).toNumber())
      setDeusTotalSupply(toBN(formatUnits(response.result.deus.total.totalSupply ?? 0, 18)).toNumber())
      setDeusMarketCap(parseFloat(response.result.deus.total.marketCap ?? 0))
      setDeusNonCirculatingSupply(
        toBN(formatUnits(response.result.deus.total.nonCirculatingSupply ?? 0, 18)).toNumber()
      )
      setDeusSupplyInBridges(toBN(formatUnits(response.result.deus.total.supplyInBridges ?? 0, 18)).toNumber())
      setDeusSupplyInVeDeusContract(
        toBN(formatUnits(response.result.deus.total.supplyInVeDeusContract ?? 0, 18)).toNumber()
      )
      setDeusTotalSupplyOnChain(toBN(formatUnits(response.result.deus.total.totalSupplyOnChain ?? 0, 18)).toNumber())
      setXDeusPrice(parseFloat(response.price.xdeus))
      setXDeusCirculatingSupply(toBN(formatUnits(response.result.xdeus.total.circulatingSupply ?? 0, 18)).toNumber())
      setXDeusMarketCap(parseFloat(response.result.xdeus.total.marketCap ?? 0))
      setXDeusNonCirculatingSupply(
        toBN(formatUnits(response.result.xdeus.total.nonCirculatingSupply ?? 0, 18)).toNumber()
      )
      setXDeusTotalSupply(toBN(formatUnits(response.result.xdeus.total.totalSupply ?? 0, 18)).toNumber())
      setCombinedSupply(
        toBN(formatUnits(response.result.deus.total.circulatingSupply ?? 0, 18)).toNumber() +
          toBN(formatUnits(response.result.xdeus.total.circulatingSupply ?? 0, 18)).toNumber()
      )
      setCombinedMarketCap(
        parseFloat(response.result.deus.total.marketCap ?? 0) + parseFloat(response.result.xdeus.total.marketCap ?? 0)
      )
      setCombinedProjectedSupply(
        (toBN(formatUnits(response.result.deus.total.circulatingSupply ?? 0, 18)).toNumber() +
          toBN(formatUnits(response.result.xdeus.total.circulatingSupply ?? 0, 18)).toNumber()) *
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
    deusNonCirculatingSupply,
    deusSupplyInBridges,
    deusSupplyInVeDeusContract,
    deusTotalSupplyOnChain,
    xDeusPrice,
    xDeusCirculatingSupply,
    xDeusMarketCap,
    xDeusNonCirculatingSupply,
    xDeusTotalSupply,
    combinedSupply,
    combinedMarketCap,
    combinedProjectedSupply,
    inflationRate,
  }
}
