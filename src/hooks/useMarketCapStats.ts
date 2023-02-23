import { formatUnits } from '@ethersproject/units'
import { DEUS_TOKEN } from 'constants/tokens'
import { useEffect, useState } from 'react'
import { makeHttpRequest } from 'utils/http'
import { toBN } from 'utils/numbers'

const DEUS_MARKETCAP_API = 'https://info.deus.finance/info/getMarketCap'

const DEUS_EMISSION_API = 'https://info.deus.finance/info/deusPerWeek'

const TOKEN_CHAIN_EXPLORER_LINK: Record<string, string> = {
  arbitrum: 'https://arbiscan.io/token/' + DEUS_TOKEN.address,
  bsc: 'https://bscscan.com/token/' + DEUS_TOKEN.address,
  fantom: 'https://ftmscan.com/token/' + DEUS_TOKEN.address,
  mainnet: 'https://etherscan.io/token/' + DEUS_TOKEN.address,
  metis: 'https://andromeda-explorer.metis.io/token/' + DEUS_TOKEN.address,
  polygon: 'https://polygonscan.com/token/' + DEUS_TOKEN.address,
  total: '',
}

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
  emissionPerWeek: number
  deusSupplyAllChain: { chainName: string; chainSupply: any; chainLink: string }[]
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
  const [emissionPerWeek, setEmissionPerWeek] = useState(0)
  const [deusSupplyAllChain, setDeusSupplyAllChain] = useState([
    { chainName: 'fantom', chainSupply: '0', chainLink: TOKEN_CHAIN_EXPLORER_LINK['fantom'] },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      const chainData: { chainName: string; chainSupply: any; chainLink: string }[] = []
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

      if (Object.keys(response.result.deus).length > 0)
        Object.keys(response.result.deus).forEach((key) => {
          chainData.push({
            chainName: key,
            chainSupply: toBN(formatUnits(response.result.deus[key].totalSupplyOnChain ?? 0, 18)).toNumber(),
            chainLink: TOKEN_CHAIN_EXPLORER_LINK[key],
          })
        })
      setDeusSupplyAllChain(chainData)
    }
    const fetchEmissionStats = async () => {
      const response = await makeHttpRequest(DEUS_EMISSION_API)
      setEmissionPerWeek(response)
      setCombinedProjectedSupply(combinedSupply + (response / 7) * 365)
      setInflationRate(100 * (((response / 7) * 365) / combinedSupply))
    }
    fetchStats()
    fetchEmissionStats()
  }, [combinedSupply])

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
    emissionPerWeek,
    deusSupplyAllChain,
  }
}
