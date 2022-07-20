import { useMemo } from 'react'
import { Token } from '@sushiswap/core-sdk'
import { formatUnits } from '@ethersproject/units'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { BN_TEN, toBN } from 'utils/numbers'
import { useDeiSwapContract } from 'hooks/useContract'

export function useSwapAmountsOut(
  amountIn: string,
  tokenIn: Token
): {
  amountOut: string
} {
  const amountInBN = amountIn ? toBN(amountIn).times(BN_TEN.pow(tokenIn.decimals)).toFixed(0) : ''
  const contract = useDeiSwapContract()

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0'
        ? []
        : [
            {
              methodName: 'calculateSwap',
              callInputs: [1, 0, amountInBN], // TODO: what is the first and second inputs?
            },
          ],
    [amountInBN]
  )

  const [bdeiSwap] = useSingleContractMultipleMethods(contract, amountOutCall)

  const amountOut = !bdeiSwap || !bdeiSwap.result ? '' : toBN(formatUnits(bdeiSwap.result[0].toString(), 18)).toString()

  return {
    amountOut,
  }
}
