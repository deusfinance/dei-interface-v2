import { useMemo } from 'react'

import { toBN } from 'utils/numbers'
import { useCLQDRContract, usePerpetualEscrowTokenReceiverContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'

export function useCalcSharesFromAmount(amountIn: string): string {
  const amountInBN = amountIn ? toBN(amountIn).times(1e18).toFixed(0) : ''
  const contract = useCLQDRContract()

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0'
        ? []
        : [
            {
              methodName: 'calcSharesFromAmount',
              callInputs: [amountInBN],
            },
          ],
    [amountInBN]
  )

  const [mintAmountOut] = useSingleContractMultipleMethods(contract, amountOutCall)

  const sharesAmount = useMemo(
    () => (!mintAmountOut || !mintAmountOut.result ? '' : toBN(mintAmountOut.result[0].toString()).toFixed(0)),
    [mintAmountOut]
  )

  return sharesAmount
}

export function useClqdrData(): {
  burningFee: string
  mintRate: number
} {
  const contract = usePerpetualEscrowTokenReceiverContract()
  const share = useCalcSharesFromAmount('1')

  const burningRateCall = useMemo(
    () => [
      {
        methodName: 'burningRate',
        callInputs: [],
      },
    ],
    []
  )

  const [burningRate] = useSingleContractMultipleMethods(contract, burningRateCall)

  const burningFee = useMemo(
    () =>
      !burningRate || !burningRate.result
        ? ''
        : toBN(1e18).minus(toBN(burningRate.result[0].toString())).div(1e18).times(100).toFixed(),
    [burningRate]
  )

  const mintRate = useMemo(() => (!share ? 0 : toBN(1).times(1e18).div(share).toNumber()), [share])

  return { burningFee, mintRate }
}
