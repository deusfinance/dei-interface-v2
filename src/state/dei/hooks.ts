import { useMemo } from 'react'
import { useAppSelector, AppState } from 'state'

const useDeiState = () => {
  return useAppSelector((state: AppState) => state.dei)
}

export const useDeiStatus = () => {
  const { status } = useDeiState()
  return useMemo(() => status, [status])
}

const usePrices = () => {
  const { prices } = useDeiState()
  return useMemo(() => prices, [prices])
}

export const useDeiPrice = () => {
  const { dei } = usePrices()
  return useMemo(() => dei, [dei])
}

export const useCollateralPrice = () => {
  const { collateral } = usePrices()
  return useMemo(() => collateral, [collateral])
}

export const useDeusPrice = () => {
  const { deus } = usePrices()
  return useMemo(() => deus, [deus])
}

export const useCollateralRatio = () => {
  const { collateralRatio } = useDeiState()
  return useMemo(() => collateralRatio, [collateralRatio])
}

export const useMintingFee = () => {
  const { mintingFee } = useDeiState()
  return useMemo(() => mintingFee, [mintingFee])
}

export const useRedemptionFee = () => {
  const { redemptionFee } = useDeiState()
  return useMemo(() => redemptionFee, [redemptionFee])
}

export const usePoolCeiling = () => {
  const { poolCeiling } = useDeiState()
  return useMemo(() => poolCeiling, [poolCeiling])
}

export const usePoolBalance = () => {
  const { poolBalance } = useDeiState()
  return useMemo(() => poolBalance, [poolBalance])
}

export const useMintPaused = () => {
  const { mintPaused } = useDeiState()
  return useMemo(() => mintPaused, [mintPaused])
}

export const useRedeemPaused = () => {
  const { redeemPaused } = useDeiState()
  return useMemo(() => redeemPaused, [redeemPaused])
}
