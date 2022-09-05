import { useState, useCallback, useMemo } from 'react'
import { Token } from '@sushiswap/core-sdk'
import { BigNumber } from 'bignumber.js'
import { formatUnits } from '@ethersproject/units'
import debounce from 'lodash/debounce'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { BN_TEN, removeTrailingZeros, toBN } from 'utils/numbers'
import { useCollateralPoolContract, useDynamicRedeemerContract, useStrategyContract } from 'hooks/useContract'
import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import useWeb3React from './useWeb3'
import useDebounce from './useDebounce'

export type RedeemTranche = {
  trancheId: number | null
  USDRatio: number
  deusRatio: number
  amountRemaining: number
  endTime: number
}

export function useRedeemData(): {
  redeemTranche: RedeemTranche
  redemptionFee: number
  deiBurned: number
  redeemPaused: boolean
} {
  const contract = useDynamicRedeemerContract()
  const currentTrancheCall = [
    {
      methodName: 'currentTranche',
      callInputs: [],
    },
    {
      methodName: 'redeemPaused',
      callInputs: [],
    },
    {
      methodName: 'redemptionFee',
      callInputs: [],
    },
    {
      methodName: 'usdTokenDecimals',
      callInputs: [],
    },
    {
      methodName: 'deiBurned',
      callInputs: [],
    },
  ]
  const [currentTranche, redeemPaused, redemptionFee, usdTokenDecimals, deiBurned] = useSingleContractMultipleMethods(
    contract,
    currentTrancheCall
  )

  //TODO
  const { currentTrancheValue, redeemPausedValue, redemptionFeeValue, usdTokenDecimalsValue, deiBurnedValue } = useMemo(
    () => ({
      currentTrancheValue: currentTranche?.result ? Number(currentTranche.result[0].toString()) : null,
      redeemPausedValue: redeemPaused?.result ? redeemPaused?.result[0] : false,
      redemptionFeeValue: redemptionFee?.result ? toBN(formatUnits(redemptionFee.result[0], 6)).toNumber() : 0,
      usdTokenDecimalsValue: usdTokenDecimals?.result ? Number(usdTokenDecimals.result[0].toString()) : null,
      deiBurnedValue: deiBurned?.result ? toBN(formatUnits(deiBurned.result[0], 18)).toNumber() : 0,
    }),
    [currentTranche, redeemPaused, redemptionFee, usdTokenDecimals, deiBurned]
  )

  const trancheDetailsCall =
    currentTrancheValue != null
      ? [
          {
            methodName: 'tranches',
            callInputs: [currentTrancheValue],
          },
          {
            methodName: 'usdRedeemPerDEI',
            callInputs: [],
          },
          {
            methodName: 'deusRedeemPerDEI',
            callInputs: [],
          },
        ]
      : []

  const [result, ...ratios] = useSingleContractMultipleMethods(contract, trancheDetailsCall)

  const redeemTranche: RedeemTranche = useMemo(() => {
    if (!result || !result.result || !result.result?.length || !ratios || !ratios.length)
      return { trancheId: null, USDRatio: 0, deusRatio: 0, amountRemaining: 0, endTime: 0 }
    const data = result.result
    return {
      trancheId: currentTrancheValue,
      USDRatio: ratios[0].result ? toBN(ratios[0].result[0].toString()).div(1e6).toNumber() : 0,
      deusRatio: ratios[1].result ? toBN(ratios[1].result[0].toString()).div(1e6).toNumber() : 0,
      amountRemaining:
        usdTokenDecimalsValue != null ? toBN(formatUnits(data.amountRemaining, usdTokenDecimalsValue)).toNumber() : 0,
      endTime: toBN(data.endTime.toString()).times(1000).toNumber(),
    } as RedeemTranche
  }, [result, ratios, currentTrancheValue, usdTokenDecimalsValue])
  return {
    redeemTranche,
    redemptionFee: redemptionFeeValue,
    deiBurned: deiBurnedValue,
    redeemPaused: redeemPausedValue,
  }
}

export function useRedeemAmounts(): {
  amountIn: string
  amountOut1: string
  amountOut2: string
  onUserInput: (amount: string) => void
  onUserOutput1: (amount: string) => void
  onUserOutput2: (amount: string) => void
} {
  const { redeemTranche, redemptionFee: fee } = useRedeemData()

  const { trancheId, USDRatio, deusRatio } = redeemTranche
  const [amountIn, setAmountIn] = useState<string>('')
  const [amountOut1, setAmountOut1] = useState<string>('')
  const [amountOut2, setAmountOut2] = useState<string>('')

  const feeFactorBN: BigNumber = useMemo(() => {
    return toBN(1 - fee / 100)
  }, [fee])

  const debounceUserInput = useCallback(
    debounce((amount: string) => {
      if (amount === '' || trancheId == null) {
        setAmountOut1('')
        setAmountOut2('')
        return
      }
      const inputAmount = toBN(amount)
      const outputAmount1 = inputAmount.times(USDRatio).times(feeFactorBN)
      const outputAmount2 = inputAmount.times(deusRatio).times(feeFactorBN)
      setAmountOut1(removeTrailingZeros(outputAmount1.toFixed(6)))
      setAmountOut2(removeTrailingZeros(outputAmount2.toFixed(6)))
    }, 300),
    [USDRatio, deusRatio, feeFactorBN, trancheId]
  )

  const debounceUserOutput1 = useCallback(
    debounce((amount: string) => {
      if (amount === '' || trancheId == null) {
        setAmountIn('')
        setAmountOut2('')
        return
      }

      const outputAmount1 = toBN(amount)
      const inputAmount = outputAmount1.div(USDRatio).div(feeFactorBN)
      const outputAmount2 = inputAmount.times(deusRatio).times(feeFactorBN)

      setAmountIn(removeTrailingZeros(inputAmount.toFixed(18)))
      setAmountOut2(removeTrailingZeros(outputAmount2.toFixed(6)))
    }, 300),
    [USDRatio, deusRatio, feeFactorBN, trancheId]
  )

  const debounceUserOutput2 = useCallback(
    debounce((amount: string) => {
      if (amount === '' || trancheId == null) {
        setAmountIn('')
        setAmountOut1('')
        return
      }

      const outputAmount2 = toBN(amount)
      const inputAmount = outputAmount2.div(deusRatio).div(feeFactorBN)
      const outputAmount1 = inputAmount.times(USDRatio).times(feeFactorBN)

      setAmountIn(removeTrailingZeros(inputAmount.toFixed(18)))
      setAmountOut1(removeTrailingZeros(outputAmount1.toFixed(6)))
    }, 300),
    [USDRatio, deusRatio, feeFactorBN, trancheId]
  )

  const onUserInput = (amount: string): void => {
    setAmountIn(amount)
    debounceUserInput(amount)
  }
  const onUserOutput1 = (amount: string): void => {
    setAmountOut1(amount)
    debounceUserOutput1(amount)
  }
  const onUserOutput2 = (amount: string): void => {
    setAmountOut2(amount)
    debounceUserOutput2(amount)
  }

  return {
    amountIn,
    amountOut1,
    amountOut2,
    onUserInput,
    onUserOutput1,
    onUserOutput2,
  }
}

export function useRedeemAmountsOut(
  amountIn: string,
  tokenIn: Token
): {
  amountOut1: string
  amountOut2: string
} {
  const amountInBN = amountIn ? toBN(amountIn).times(BN_TEN.pow(tokenIn.decimals)).toFixed(0) : ''
  const contract = useDynamicRedeemerContract()

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0'
        ? []
        : [
            {
              methodName: 'usdRedeemValue',
              callInputs: [amountInBN],
            },
            {
              methodName: 'deusRedeemValue',
              callInputs: [amountInBN],
            },
          ],
    [amountInBN]
  )

  const [usdRedeem, deusRedeem] = useSingleContractMultipleMethods(contract, amountOutCall)

  const amountOut1 =
    !usdRedeem || !usdRedeem.result ? '' : toBN(formatUnits(usdRedeem.result[0].toString(), 6)).toString()

  const amountOut2 =
    !deusRedeem || !deusRedeem.result ? '' : toBN(formatUnits(deusRedeem.result[0].toString(), 6)).toString()

  return {
    amountOut1,
    amountOut2,
  }
}

export function useRedeemAmountOut(amountIn: string): {
  collateralAmount: string
  deusValue: string
} {
  const amountInBN = amountIn ? toBN(amountIn).times(BN_TEN.pow(DEI_TOKEN.decimals)).toFixed(0) : ''
  const contract = useCollateralPoolContract()

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0'
        ? []
        : [
            {
              methodName: 'collateralAndDeusValueForRedeeming',
              callInputs: [amountInBN],
            },
          ],
    [amountInBN]
  )

  const [mintAmountOuts] = useSingleContractMultipleMethods(contract, amountOutCall)

  const collateralAmount =
    !mintAmountOuts || !mintAmountOuts.result
      ? ''
      : toBN(formatUnits(mintAmountOuts.result[0].toString(), USDC_TOKEN.decimals)).toString()
  const deusValue =
    !mintAmountOuts || !mintAmountOuts.result
      ? ''
      : toBN(formatUnits(mintAmountOuts.result[1].toString(), DEUS_TOKEN.decimals)).toString()

  return {
    collateralAmount,
    deusValue,
  }
}

export function useGetPoolData() {
  const contract = useCollateralPoolContract()
  const { account } = useWeb3React()

  const call = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'getAllPositions',
              callInputs: [account],
            },
            {
              methodName: 'getUnRedeemedPositions',
              callInputs: [account],
            },
            {
              methodName: 'nextRedeemId',
              callInputs: [account],
            },
            {
              methodName: 'redeemCollateralBalances',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [allPositions, unRedeemedPositions, nextRedeemId, redeemCollateralBalances] = useSingleContractMultipleMethods(
    contract,
    call
  )
  const isLoading = useDebounce(
    allPositions?.loading || nextRedeemId?.loading || redeemCollateralBalances?.loading || unRedeemedPositions?.loading,
    500
  )

  const allPositionsRes = !allPositions || !allPositions.result ? '' : allPositions.result[0]

  const unRedeemedPositionsRes =
    !unRedeemedPositions || !unRedeemedPositions.result ? '' : unRedeemedPositions.result[0]

  const nextRedeemIdRes = !nextRedeemId || !nextRedeemId.result ? '' : nextRedeemId.result[0].toString()

  const redeemCollateralBalancesRes =
    !redeemCollateralBalances || !redeemCollateralBalances.result
      ? ''
      : toBN(formatUnits(redeemCollateralBalances?.result[0].toString(), USDC_TOKEN.decimals)).toString()

  return {
    allPositions: allPositionsRes,
    unRedeemedPositions: unRedeemedPositionsRes,
    nextRedeemId: nextRedeemIdRes,
    redeemCollateralBalances: redeemCollateralBalancesRes,
    isLoading,
  }
}

export function useGetStrategyAddress(): string {
  const contract = useCollateralPoolContract()

  const call = useMemo(
    () => [
      {
        methodName: 'strategy',
        callInputs: [],
      },
    ],
    []
  )

  const [strategyAddressRes] = useSingleContractMultipleMethods(contract, call)

  return !strategyAddressRes || !strategyAddressRes.result ? '' : strategyAddressRes.result[0].toString()
}

export function useGetCollateralRatios() {
  const address = useGetStrategyAddress()
  const contract = useStrategyContract(address)

  const call = useMemo(
    () => [
      {
        methodName: 'mintCollateralRatio',
        callInputs: [],
      },
      {
        methodName: 'redeemCollateralRatio',
        callInputs: [],
      },
    ],
    []
  )
  const [mintCollateralRatio, redeemCollateralRatio] = useSingleContractMultipleMethods(contract, call)

  const mintCollateralRatioRes =
    !mintCollateralRatio || !mintCollateralRatio.result ? '' : formatUnits(mintCollateralRatio.result[0]?.toString(), 4)
  const redeemCollateralRatioRes =
    !redeemCollateralRatio || !redeemCollateralRatio.result
      ? ''
      : formatUnits(redeemCollateralRatio.result[0]?.toString(), 4)

  return { mintCollateralRatio: mintCollateralRatioRes, redeemCollateralRatio: redeemCollateralRatioRes }
}
