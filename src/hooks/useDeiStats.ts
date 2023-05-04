import { useEffect, useMemo, useState } from 'react'
import { formatUnits } from '@ethersproject/units'

import { USDCReserves1 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { toBN } from 'utils/numbers'

import { CollateralPool } from '../constants/addresses'
import { makeHttpRequest } from 'utils/http'

const DEI_RESERVES_DETAILED_API = 'https://info.deus.finance/info/dei/reserves/detail'
const DEI_STATS_API = 'https://info.deus.finance/info/dei/getDeiStats'

export function useDeiStats(): {
  totalSupply: number
  outstandingSupply: number
  usdcPoolReserves: number
  totalUSDCReserves: number
  collateralRatio: number
  multiSigReserves: number
  usdcReserves1: number
  seigniorage: number
  protocolOwnedDei: number
} {
  const [totalUSDCReserves, setTotalUSDCReserves] = useState(0)
  const [outstandingSupply, setOutstandingSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [usdcReserves1, setUsdcReserves1] = useState(0)
  const [usdcPoolReserves, setUsdcPoolReserves] = useState(0)
  const [seigniorage, setSeigniorage] = useState(0)
  const [collateralRatio, setCollateralRatio] = useState(0)
  const [protocolOwnedDei, setProtocolOwnedDei] = useState(0)

  const multiSigReserves = useMemo(
    () => totalUSDCReserves - usdcPoolReserves - usdcReserves1,
    [totalUSDCReserves, usdcPoolReserves, usdcReserves1]
  )

  useEffect(() => {
    const fetchDetailedReservesStats = async () => {
      const response = await makeHttpRequest(DEI_RESERVES_DETAILED_API)
      setUsdcReserves1(
        parseFloat(response['wallets'][USDCReserves1[SupportedChainId.FANTOM]]['fantom'][0]?.balance ?? 0)
      )
      setUsdcPoolReserves(
        parseFloat(response['wallets'][CollateralPool[SupportedChainId.FANTOM]]['fantom'][0]?.balance ?? 0)
      )
    }
    const fetchDeiStats = async () => {
      const response = await makeHttpRequest(DEI_STATS_API)
      setSeigniorage(parseFloat(response['deiSeigniorageRatio'] ?? 0))
      setCollateralRatio(parseFloat(response['usdcBackingPerDei'] ?? 0) * 100)
      setTotalUSDCReserves(parseFloat(response['reserves']['total'] ?? 0))
      setTotalSupply(toBN(formatUnits(response['totalSupply'], 18)).toNumber())
      setOutstandingSupply(toBN(formatUnits(response['outstanding'], 18)).toNumber())
      setProtocolOwnedDei(toBN(formatUnits(response['protocolOwnedDei'], 18)).toNumber())
    }
    fetchDeiStats()
    fetchDetailedReservesStats()
  }, [])

  return {
    totalSupply,
    outstandingSupply,
    usdcPoolReserves,
    usdcReserves1,
    totalUSDCReserves,
    multiSigReserves,
    collateralRatio,
    seigniorage,
    protocolOwnedDei,
  }
}
