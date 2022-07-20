import { useMemo } from 'react'
import { useAppSelector, AppState } from 'state'

export const useDashboardState = () => {
  return useAppSelector((state: AppState) => state.dashboard)
}

export const useDeusMetrics = () => {
  const {
    deusPrice,
    deusMarketCap,
    deusCirculatingSupply,
    deusTotalSupply,
    deusFullyDilutedValuation,
    deusEmissions,
    deusBurnedEvents,
    deusDexLiquidity,
    stakedDeusLiquidity,
  } = useDashboardState()
  return useMemo(() => {
    return {
      deusPrice,
      deusMarketCap,
      deusCirculatingSupply,
      deusTotalSupply,
      deusFullyDilutedValuation,
      deusEmissions,
      deusBurnedEvents,
      deusDexLiquidity,
      stakedDeusLiquidity,
    }
  }, [
    deusPrice,
    deusCirculatingSupply,
    deusMarketCap,
    deusTotalSupply,
    deusFullyDilutedValuation,
    deusEmissions,
    deusBurnedEvents,
    deusDexLiquidity,
    stakedDeusLiquidity,
  ])
}

export const useDeiMetrics = () => {
  const { deiMarketCap, deiTotalSupply, deiDexLiquidity, mintedDei, stakedDeiLiquidity } = useDashboardState()
  return useMemo(() => {
    return { deiMarketCap, deiTotalSupply, deiDexLiquidity, mintedDei, stakedDeiLiquidity }
  }, [deiMarketCap, deiTotalSupply, deiDexLiquidity, mintedDei, stakedDeiLiquidity])
}

export const useDeusPrice = () => {
  const { deusPrice } = useDeusMetrics()
  return useMemo(() => {
    return deusPrice
  }, [deusPrice])
}

export const useDeiMarketCap = () => {
  const { deiMarketCap } = useDeiMetrics()
  return useMemo(() => {
    return deiMarketCap
  }, [deiMarketCap])
}
