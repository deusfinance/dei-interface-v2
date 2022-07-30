import { useEffect, useMemo } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'
import BN from 'bignumber.js'

import { autoRefresh } from 'utils/retry'
import useWeb3React from 'hooks/useWeb3'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useCollateralPoolContract, useDeiContract } from 'hooks/useContract'

import { useCollateralPrice } from './hooks'
import {
  DeiSupportedChains,
  DeiStatus,
  Scales,
  NUMBER_OF_POOLS,
  fetchPrices,
  updateMintPaused,
  updateRedeemPaused,
} from './reducer'
import {
  updateStatus,
  updateCollateralRatio,
  updatePoolBalance,
  updatePoolCeiling,
  updateMintingFee,
  updateRedemptionFee,
} from './reducer'

export default function Updater(): null {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()
  const thunkDispatch: AppThunkDispatch = useAppDispatch()
  const DeiContract = useDeiContract()
  const CollateralPoolContract = useCollateralPoolContract()
  const collateralPrice = useCollateralPrice()

  const isSupported: boolean = useMemo(() => {
    return chainId ? Object.values(DeiSupportedChains).includes(chainId) : false
  }, [chainId])

  // Returns a range of undefined if !isSupported (indirectly)
  const [collateralRatioScale, feeScale, poolCeilingScale, poolBalanceScale]: Array<number | undefined> =
    useMemo(() => {
      const scale = chainId ? Scales[chainId] : undefined
      return [scale?.collateralRatio, scale?.fee, scale?.poolCeiling, scale?.poolBalance]
    }, [chainId])

  const priceMapping: number[] = useMemo(() => {
    if (!isSupported || !chainId || !collateralPrice || collateralRatioScale == undefined) return []
    const LEN = NUMBER_OF_POOLS[chainId]

    if (!LEN) {
      console.error('Number of pools is not defined for chainId: ', chainId)
      dispatch(updateStatus(DeiStatus.ERROR))
      return []
    }

    const result = []
    for (let i = 0; i < LEN; i++) {
      result.push(collateralPrice * collateralRatioScale)
    }
    return result
  }, [dispatch, isSupported, chainId, collateralPrice, collateralRatioScale])

  const infoCalls = useMemo(
    () => (!isSupported && priceMapping.length ? [] : [{ methodName: 'dei_info', callInputs: [priceMapping] }]),
    [isSupported, priceMapping]
  )

  const poolCalls = useMemo(
    () =>
      !isSupported
        ? []
        : [
            { methodName: 'minting_fee', callInputs: [] },
            { methodName: 'redemption_fee', callInputs: [] },
            { methodName: 'pool_ceiling', callInputs: [] },
            { methodName: 'collatDollarBalance', callInputs: [collateralPrice] },
            { methodName: 'mintPaused', callInputs: [] },
            { methodName: 'redeemPaused', callInputs: [] },
          ],
    [isSupported, collateralPrice]
  )

  const userCalls = useMemo(() => {
    if (!account) return []
    return [
      { methodName: 'redeemCollateralBalances', callInputs: [account] },
      { methodName: 'redeemDEUSBalances', callInputs: [account] },
    ]
  }, [account])

  // using singleContractMultipleMethods just so we can default if !isSupported
  // const infoResponse = useSingleCallResult(DeiContract, 'dei_info', [priceMapping])
  const infoResponse = useSingleContractMultipleMethods(DeiContract, infoCalls)
  const poolResponse = useSingleContractMultipleMethods(CollateralPoolContract, poolCalls)
  const userResponse = useSingleContractMultipleMethods(CollateralPoolContract, userCalls)

  useEffect(() => {
    if (!collateralRatioScale || !feeScale || !poolCeilingScale || !poolBalanceScale) return
    const [mintingFee, redemptionFee, poolCeiling, poolBalance, mintPaused, redeemPaused] = poolResponse

    if (infoResponse[0]?.result) {
      const globalCollateralRatio = infoResponse[0].result[1]
      dispatch(updateCollateralRatio(new BN(globalCollateralRatio.toString()).div(collateralRatioScale).toNumber()))
    }
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
    if (poolCeiling?.result) {
      const result = new BN(poolCeiling.result[0].toString()).div(poolCeilingScale).toNumber()
      dispatch(updatePoolCeiling(result))
    }
    if (poolBalance?.result) {
      const result = new BN(poolBalance.result[0].toString()).div(poolBalanceScale).toNumber()
      dispatch(updatePoolBalance(result))
    }
  }, [
    dispatch,
    isSupported,
    infoResponse,
    collateralRatioScale,
    poolResponse,
    feeScale,
    poolCeilingScale,
    poolBalanceScale,
  ])

  useEffect(() => {
    if (chainId && isSupported) {
      return autoRefresh(() => thunkDispatch(fetchPrices({ chainId })), 45)
    }
  }, [thunkDispatch, chainId, isSupported])

  return null
}
