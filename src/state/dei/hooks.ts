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

export const useMintCollateralRatio = () => {
  const { mintCollateralRatio } = useDeiState()
  return useMemo(() => mintCollateralRatio, [mintCollateralRatio])
}
export const useRedeemCollateralRatio = () => {
  const { redeemCollateralRatio } = useDeiState()
  return useMemo(() => redeemCollateralRatio, [redeemCollateralRatio])
}

export const useMintingFee = () => {
  const { mintingFee } = useDeiState()
  return useMemo(() => mintingFee, [mintingFee])
}

export const useRedemptionFee = () => {
  const { redemptionFee } = useDeiState()
  return useMemo(() => redemptionFee, [redemptionFee])
}

export const useMintPaused = () => {
  const { mintPaused } = useDeiState()
  return useMemo(() => mintPaused, [mintPaused])
}

export const useRedeemPaused = () => {
  const { redeemPaused } = useDeiState()
  return useMemo(() => redeemPaused, [redeemPaused])
}

export const useCollateralCollectionDelay = () => {
  const { collateralCollectionDelay } = useDeiState()
  return useMemo(() => collateralCollectionDelay, [collateralCollectionDelay])
}

export const useDeusCollectionDelay = () => {
  const { deusCollectionDelay } = useDeiState()
  return useMemo(() => deusCollectionDelay, [deusCollectionDelay])
}

export const useExpiredPrice = () => {
  const { expiredPrice } = useDeiState()
  return useMemo(() => expiredPrice, [expiredPrice])
}
