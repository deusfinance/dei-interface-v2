import { useEffect, useMemo, useState } from 'react'
import { formatUnits } from '@ethersproject/units'

import { USDCReserves1 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { toBN } from 'utils/numbers'

import { CollateralPool } from '../constants/addresses'
import { makeHttpRequest } from 'utils/http'
const DEI_STATS_API = 'https://info.deus.finance/info/dei/getDeiStats'

export function useDeiStats(): {
  totalSupply: number
  circulatingSupply: number
  usdcPoolReserves: number
  totalUSDCReserves: number
  collateralRatio: number
  multiSigReserves: number
  usdcReserves1: number
  seigniorage: number
  reservesTokenBalances: any
} {
  const [totalUSDCReserves, setTotalUSDCReserves] = useState(0)
  const [circulatingSupply, setCirculatingSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [usdcReserves1, setUsdcReserves1] = useState(0)
  const [usdcPoolReserves, setUsdcPoolReserves] = useState(0)
  const [seigniorage, setSeigniorage] = useState(0)
  const [reservesTokenBalances, setReservesTokenBalances] = useState({})

  const multiSigReserves = useMemo(
    () => totalUSDCReserves - usdcPoolReserves - usdcReserves1,
    [totalUSDCReserves, usdcPoolReserves, usdcReserves1]
  )

  const collateralRatio = useMemo(() => {
    return circulatingSupply > 0 ? (totalUSDCReserves / circulatingSupply) * 100 : 0
  }, [totalUSDCReserves, circulatingSupply])

  useEffect(() => {
    const fetchDeiStats = async () => {
      const response = await makeHttpRequest(DEI_STATS_API)
      setSeigniorage(parseFloat(response['deiSeigniorageRatio'] ?? 0))
      setTotalSupply(toBN(formatUnits(response['circulatingSupply'], 18)).toNumber())
      setCirculatingSupply(toBN(formatUnits(response['circulatingSupply'], 18)).toNumber())
      setTotalUSDCReserves(parseFloat(response['reserves']['total'] ?? 0))
      setUsdcReserves1(
        parseFloat(response['reserves']['wallets'][USDCReserves1[SupportedChainId.FANTOM]]['fantom'][0]?.balance ?? 0)
      )
      setUsdcPoolReserves(
        parseFloat(response['reserves']['wallets'][CollateralPool[SupportedChainId.FANTOM]]['fantom'][0]?.balance ?? 0)
      )
      setReservesTokenBalances(response['reserves']['tokenBalances'])
    }
    fetchDeiStats()
  }, [])

  useEffect(() => {
    const fetchReservesStats = async () => {
      const response = await makeHttpRequest(DEI_RESERVES_API)
      setTotalUSDCReserves(parseFloat(response ?? 0))
    }
    const fetchCirculatingSupplyStats = async () => {
      const response = await makeHttpRequest(DEI_CIRC_SUPPLY_API)
      // TODO: as API returns number hence converting it back to string for handling big numbers. Remove once API returns string
      const result = response.toLocaleString('fullwide', { useGrouping: false })
      setTotalSupply(toBN(formatUnits(result, 18)).toNumber())
      setCirculatingSupply(toBN(formatUnits(result, 18)).toNumber())
    }
    const fetchDetailedReservesStats = async () => {
      const response = await makeHttpRequest(DEI_RESERVES_DETAILED_API)
      setUsdcReserves1(parseFloat(response[USDCReserves1[SupportedChainId.FANTOM]]['fantom'][0]?.balance ?? 0))
      setUsdcPoolReserves(parseFloat(response[CollateralPool[SupportedChainId.FANTOM]]['fantom'][0]?.balance ?? 0))
    }
    fetchReservesStats()
    fetchCirculatingSupplyStats()
    fetchDetailedReservesStats()
  }, [])

  return {
    totalSupply,
    circulatingSupply,
    usdcPoolReserves,
    usdcReserves1,
    totalUSDCReserves,
    multiSigReserves,
    collateralRatio,
    reservesTokenBalances,
    seigniorage,
  }
}
