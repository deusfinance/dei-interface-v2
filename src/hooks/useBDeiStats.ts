import { useMemo } from 'react'

import { useStablePoolContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { formatUnits } from '@ethersproject/units'
import { BN_TEN, toBN } from 'utils/numbers'
import { LiquidityPool } from 'constants/stakingPools'

const BDEI_TOKEN_INDEX = 1
const DEI_TOKEN_INDEX = 0
const ONE = toBN(1).times(BN_TEN.pow(18)).toFixed(0) // 10 ** 18, to be used as input to calculate swap ratio

export function useBDeiStats(): {
  swapRatio: number
  bDeiBalance: number
  deiBalance: number
} {
  const contract = useStablePoolContract(LiquidityPool[0])

  const methodCalls = useMemo(
    () => [
      {
        methodName: 'getTokenBalance',
        callInputs: [BDEI_TOKEN_INDEX],
      },
      {
        methodName: 'getTokenBalance',
        callInputs: [DEI_TOKEN_INDEX],
      },
      {
        methodName: 'calculateSwap',
        callInputs: [BDEI_TOKEN_INDEX, DEI_TOKEN_INDEX, ONE],
      },
    ],
    []
  )

  const [bDeiBalanceRaw, deiBalanceRaw, swapRatioRaw] = useSingleContractMultipleMethods(contract, methodCalls)

  const { bDeiBalance, deiBalance, swapRatio } = useMemo(() => {
    return {
      bDeiBalance: bDeiBalanceRaw?.result ? toBN(formatUnits(bDeiBalanceRaw.result[0], 18)).toNumber() : 0,
      deiBalance: deiBalanceRaw?.result ? toBN(formatUnits(deiBalanceRaw.result[0], 18)).toNumber() : 0,
      swapRatio: swapRatioRaw?.result ? toBN(formatUnits(swapRatioRaw.result[0], 18)).toNumber() : 0,
    }
  }, [bDeiBalanceRaw, deiBalanceRaw, swapRatioRaw])

  return { swapRatio, bDeiBalance, deiBalance }
}
