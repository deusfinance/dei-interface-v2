import { useMemo } from 'react'
import { Token } from '@sushiswap/core-sdk'
import { formatUnits } from '@ethersproject/units'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { BN_TEN, toBN } from 'utils/numbers'
import { useStablePoolContract } from 'hooks/useContract'
import { getTokenIndex, StablePoolType } from 'constants/sPools'
import { LiquidityPool } from 'constants/stakingPools'

export function useSwapAmountsOut(
  amountIn: string,
  tokenIn: Token,
  tokenOut: Token,
  pool: StablePoolType
): {
  amountOut: string
} {
  console.log('pool info', pool)
  const amountInBN = amountIn ? toBN(amountIn).times(BN_TEN.pow(tokenIn.decimals)).toFixed(0) : ''
  const liquidityPool = LiquidityPool.find((liqPool) => liqPool.id === pool.id) || LiquidityPool[0]
  const contract = useStablePoolContract(liquidityPool)

  const [inputIndex, outputIndex] = useMemo(() => {
    return [getTokenIndex(tokenIn.address, pool), getTokenIndex(tokenOut.address, pool)]
  }, [tokenIn, tokenOut, pool])

  const positions = useMemo(() => {
    if (inputIndex !== null && outputIndex !== null) return [inputIndex, outputIndex]
    return null
  }, [inputIndex, outputIndex])

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0' || !positions
        ? []
        : [
            {
              methodName: 'calculateSwap',
              callInputs: [...positions, amountInBN],
            },
          ],
    [amountInBN, positions]
  )

  const [result] = useSingleContractMultipleMethods(contract, amountOutCall)

  const amountOut =
    !result || !result.result ? '' : toBN(formatUnits(result.result[0].toString(), tokenOut.decimals)).toString()

  return {
    amountOut,
  }
}
