import { useMemo } from 'react'

import { toBN } from 'utils/numbers'
import { useCLQDRContract } from 'hooks/useContract'
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

  console.log({ sharesAmount })

  return sharesAmount
}
