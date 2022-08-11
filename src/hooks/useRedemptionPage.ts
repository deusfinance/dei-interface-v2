import { useEffect, useMemo } from 'react'
import { Token } from '@sushiswap/core-sdk'
import { formatUnits } from '@ethersproject/units'
import { useAppDispatch } from 'state'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { updateMintCollateralRatio, updateRedeemCollateralRatio } from 'state/dei/reducer'
import { useCollateralPoolContract, useDynamicRedeemerContract, useStrategyContract } from 'hooks/useContract'
import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { BN_TEN, toBN } from 'utils/numbers'
import useWeb3React from './useWeb3'
import useDebounce from './useDebounce'

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
  const dispatch = useAppDispatch()

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

  //TODO: move it to redux later
  useEffect(() => {
    dispatch(updateMintCollateralRatio(mintCollateralRatioRes))
    dispatch(updateRedeemCollateralRatio(redeemCollateralRatioRes))
  }, [dispatch, mintCollateralRatioRes, redeemCollateralRatioRes])

  return { mintCollateralRatio: mintCollateralRatioRes, redeemCollateralRatio: redeemCollateralRatioRes }
}
