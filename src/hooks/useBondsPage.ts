import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useDeiBonderContract } from 'hooks/useContract'
import { toBN } from 'utils/numbers'

export type BondNFT = {
  tokenId: number
  deiAmount: null | number
  redeemTime: null | number
}

export function useBonderData(): {
  deiBonded: number
  bondingPaused: boolean
} {
  const contract = useDeiBonderContract()
  const calls = [
    {
      methodName: 'bondingPaused',
      callInputs: [],
    },
    {
      methodName: 'deiBonded',
      callInputs: [],
    },
  ]
  const [bondingPaused, deiBonded] = useSingleContractMultipleMethods(contract, calls)

  const { bondingPausedValue, deiBondedValue } = useMemo(
    () => ({
      bondingPausedValue: bondingPaused?.result ? bondingPaused?.result[0] : false,
      deiBondedValue: deiBonded?.result ? toBN(formatUnits(deiBonded.result[0], 18)).toNumber() : 0,
    }),
    [bondingPaused, deiBonded]
  )

  return {
    bondingPaused: bondingPausedValue,
    deiBonded: deiBondedValue,
  }
}

export function useGetRedeemTime(amountIn: string): {
  redeemTime: number
} {
  const contract = useDeiBonderContract()
  const amountInBN = toBN(amountIn).times(1e18).toFixed()

  const calls = [
    {
      methodName: 'getRedeemTime',
      callInputs: [amountInBN],
    },
  ]
  const [redeemTime] = useSingleContractMultipleMethods(contract, calls)

  const { redeemTimeValue } = useMemo(
    () => ({
      redeemTimeValue: redeemTime?.result ? toBN(redeemTime.result[0].toString()).times(1000).toNumber() : 0,
    }),
    [redeemTime]
  )

  return {
    redeemTime: redeemTimeValue,
  }
}

export function useBondsAmountsOut(amountIn: string): {
  amountOut: string
} {
  const amountOut = amountIn
  return {
    amountOut,
  }
}

export function useUserBondNFTs(): BondNFT[] {
  return useMemo(
    () => [
      {
        tokenId: 1,
        deiAmount: 10000,
        redeemTime: 16684698464,
      },
      {
        tokenId: 3,
        deiAmount: 20000,
        redeemTime: 13333698464,
      },
    ],
    []
  )
}
