import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useStablePoolContract } from 'hooks/useContract'

import { BN_TEN, toBN } from 'utils/numbers'
import { LiquidityType } from 'constants/stakingPools'

export function usePoolBalances(pool: LiquidityType): number[] {
  const contract = useStablePoolContract(pool)

  const tokenBalancesCall = useMemo(
    () =>
      pool.tokens.map((t, index) => ({
        methodName: 'getTokenBalance',
        callInputs: [index],
      })),
    [pool]
  )
  const results = useSingleContractMultipleMethods(contract, tokenBalancesCall)

  return useMemo(() => {
    if (!results || !results.length) return []

    return results.map((result, index: number) => {
      if (!result.result?.length) return 0
      return toBN(result.result[0].toString()).div(BN_TEN.pow(pool.tokens[index].decimals)).toNumber()
    })
  }, [results, pool])
}

export function usePoolInfo(pool: LiquidityType): { virtualPrice: number; protocolFee: number } {
  const contract = useStablePoolContract(pool)

  const calls = [
    {
      methodName: 'getVirtualPrice',
      callInputs: [],
    },
    {
      methodName: 'protocolFeeShareBPS',
      callInputs: [],
    },
  ]

  const [virtualPrice, protocolFee] = useSingleContractMultipleMethods(contract, calls)

  const { virtualPriceValue, protocolFeeValue } = useMemo(
    () => ({
      virtualPriceValue: virtualPrice?.result ? toBN(virtualPrice.result[0].toString()).div(1e18).toNumber() : 0,
      protocolFeeValue: protocolFee?.result ? toBN(protocolFee.result[0].toString()).div(1e18).toNumber() : 0,
    }),
    [virtualPrice, protocolFee]
  )

  return {
    virtualPrice: virtualPriceValue,
    protocolFee: protocolFeeValue,
  }
}

export function useAddLiquidity(pool: LiquidityType, amountIns: string[]): number {
  const contract = useStablePoolContract(pool)

  const amountsInBN: string[] = useMemo(() => {
    return amountIns.map((amount, index) => {
      if (!amount) return '0'
      return toBN(amount).times(BN_TEN.pow(pool.tokens[index].decimals)).toFixed()
    })
  }, [amountIns, pool])

  const liqCalls = useMemo(
    () =>
      !amountsInBN.length
        ? []
        : [
            {
              methodName: 'calculateTokenAmount',
              callInputs: [amountsInBN, 'true'],
            },
          ],
    [amountsInBN]
  )

  const [result] = useSingleContractMultipleMethods(contract, liqCalls)

  return useMemo(() => {
    if (!result || !result.result?.length) return 0
    return toBN(result.result[0].toString()).div(1e18).toNumber()
  }, [result])
}

export function useRemoveLiquidity(pool: LiquidityType, amountIn: string): number[] {
  const contract = useStablePoolContract(pool)

  const amountInBN = toBN(amountIn).times(1e18).toFixed()
  const liqCalls = useMemo(
    () =>
      amountIn == ''
        ? []
        : [
            {
              methodName: 'calculateRemoveLiquidity',
              callInputs: [amountInBN],
            },
          ],
    [amountIn, amountInBN]
  )

  const [result] = useSingleContractMultipleMethods(contract, liqCalls)

  return useMemo(() => {
    if (!result || !result.result?.length) return []
    if (!result.result[0].length) return []
    return result.result[0].map((balance: BigNumber, index: number) => {
      return toBN(balance.toString()).div(BN_TEN.pow(pool.tokens[index].decimals)).toNumber().toString()
    })
  }, [result, pool])
}
