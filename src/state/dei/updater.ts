import { useEffect, useMemo } from 'react'
import { useAppDispatch } from 'state'
import BN from 'bignumber.js'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useCollateralPoolContract } from 'hooks/useContract'

import { DeiSupportedChains, Scales, updateMintPaused, updateRedeemPaused } from './reducer'
import {
  updateCollectionPaused,
  updateCollateralCollectionDelay,
  updateDeusCollectionDelay,
  updateMintingFee,
  updateRedemptionFee,
} from './reducer'

export default function Updater(): null {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  // const DeiContract = useDeiContract()
  const CollateralPoolContract = useCollateralPoolContract()

  const isSupported: boolean = useMemo(() => {
    return chainId ? Object.values(DeiSupportedChains).includes(chainId) : false
  }, [chainId])

  // Returns a range of undefined if !isSupported (indirectly)
  const [collateralRatioScale, feeScale, poolCeilingScale, poolBalanceScale]: Array<number | undefined> =
    useMemo(() => {
      const scale = chainId ? Scales[chainId] : undefined
      return [scale?.collateralRatio, scale?.fee, scale?.poolCeiling, scale?.poolBalance]
    }, [chainId])

  // const priceMapping: number[] = useMemo(() => {
  //   if (!isSupported || !chainId || !collateralPrice || collateralRatioScale == undefined) return []
  //   const LEN = NUMBER_OF_POOLS[chainId]

  //   if (!LEN) {
  //     console.error('Number of pools is not defined for chainId: ', chainId)
  //     dispatch(updateStatus(DeiStatus.ERROR))
  //     return []
  //   }

  //   const result = []
  //   for (let i = 0; i < LEN; i++) {
  //     result.push(collateralPrice * collateralRatioScale)
  //   }
  //   return result
  // }, [dispatch, isSupported, chainId, collateralPrice, collateralRatioScale])

  // const infoCalls = useMemo(
  //   () => (!isSupported && priceMapping.length ? [] : [{ methodName: 'dei_info', callInputs: [priceMapping] }]),
  //   [isSupported, priceMapping]
  // )

  const poolCalls = useMemo(
    () =>
      !isSupported
        ? []
        : [
            { methodName: 'mintingFee', callInputs: [] },
            { methodName: 'redemptionFee', callInputs: [] },
            { methodName: 'collectionPaused', callInputs: [] },
            { methodName: 'collateralCollectionDelay', callInputs: [] },
            { methodName: 'deusCollectionDelay', callInputs: [] },
            { methodName: 'mintPaused', callInputs: [] },
            { methodName: 'redeemPaused', callInputs: [] },
          ],
    [isSupported]
  )

  // const userCalls = useMemo(() => {
  //   if (!account) return []
  //   return [
  //     { methodName: 'nextRedeemId', callInputs: [account] },
  //     { methodName: 'getUnRedeemedPositions', callInputs: [account] },
  //     { methodName: 'redeemCollateralBalances', callInputs: [account] },
  //   ]
  // }, [account])

  // using singleContractMultipleMethods just so we can default if !isSupported
  // const infoResponse = useSingleCallResult(DeiContract, 'dei_info', [priceMapping])
  // const infoResponse = useSingleContractMultipleMethods(DeiContract, infoCalls)
  // const userResponse = useSingleContractMultipleMethods(CollateralPoolContract, userCalls)
  const poolResponse = useSingleContractMultipleMethods(CollateralPoolContract, poolCalls)

  useEffect(() => {
    if (!collateralRatioScale || !feeScale || !poolCeilingScale || !poolBalanceScale) return
    const [
      mintingFee,
      redemptionFee,
      collectionPaused,
      collateralCollectionDelay,
      deusCollectionDelay,
      mintPaused,
      redeemPaused,
    ] = poolResponse

    if (mintingFee?.result) {
      const result = new BN(mintingFee.result[0].toString()).div(feeScale).toNumber()
      dispatch(updateMintingFee(result))
    }
    if (redemptionFee?.result) {
      const result = new BN(redemptionFee.result[0].toString()).div(feeScale).toNumber()
      dispatch(updateRedemptionFee(result))
    }
    if (mintPaused?.result) {
      const result = mintPaused.result[0]
      dispatch(updateMintPaused(result))
    }
    if (redeemPaused?.result) {
      const result = redeemPaused.result[0]
      dispatch(updateRedeemPaused(result))
    }
    if (collectionPaused?.result) {
      const result = collectionPaused.result[0]
      dispatch(updateCollectionPaused(result))
    }

    if (collateralCollectionDelay?.result) {
      const result = new BN(collateralCollectionDelay.result[0].toString()).toNumber()
      dispatch(updateCollateralCollectionDelay(result))
    }
    if (deusCollectionDelay?.result) {
      const result = new BN(deusCollectionDelay.result[0].toString()).toNumber()
      dispatch(updateDeusCollectionDelay(result))
    }
  }, [dispatch, isSupported, collateralRatioScale, poolResponse, feeScale, poolCeilingScale, poolBalanceScale])

  // useEffect(() => {
  //   if (chainId && isSupported) {
  //     return autoRefresh(() => thunkDispatch(fetchPrices({ chainId })), 45)
  //   }
  // }, [thunkDispatch, chainId, isSupported])

  return null
}
