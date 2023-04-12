import { useMemo } from 'react'

import { useStablePoolContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { formatUnits } from '@ethersproject/units'
import { BN_TEN, toBN } from 'utils/numbers'
import { LiquidityPool } from 'constants/stakingPools'

const XDEUS_TOKEN_INDEX = 0
const DEUS_TOKEN_INDEX = 1
const ONE = toBN(1).times(BN_TEN.pow(18)).toFixed(0) // 10 ** 18, to be used as input to calculate swap ratio

export function useXDeusStats(): {
  swapRatio: number
  xDeusBalance: number
  deusBalance: number
} {
  const contract = useStablePoolContract(LiquidityPool[2])

  const methodCalls = useMemo(
    () => [
      {
        methodName: 'getTokenBalance',
        callInputs: [XDEUS_TOKEN_INDEX],
      },
      {
        methodName: 'getTokenBalance',
        callInputs: [DEUS_TOKEN_INDEX],
      },
      {
        methodName: 'calculateSwap',
        callInputs: [XDEUS_TOKEN_INDEX, DEUS_TOKEN_INDEX, ONE],
      },
    ],
    []
  )

  const [xdeusBalanceRaw, deusBalanceRaw, swapRatioRaw] = useSingleContractMultipleMethods(contract, methodCalls)

  const { xDeusBalance, deusBalance, swapRatio } = useMemo(() => {
    return {
      xDeusBalance: xdeusBalanceRaw?.result ? toBN(formatUnits(xdeusBalanceRaw.result[0], 18)).toNumber() : 0,
      deusBalance: deusBalanceRaw?.result ? toBN(formatUnits(deusBalanceRaw.result[0], 18)).toNumber() : 0,
      swapRatio: swapRatioRaw?.result ? toBN(formatUnits(swapRatioRaw.result[0], 18)).toNumber() : 0,
    }
  }, [xdeusBalanceRaw, deusBalanceRaw, swapRatioRaw])

  return { swapRatio, xDeusBalance, deusBalance }
}
