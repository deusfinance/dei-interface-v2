import { useMemo, useCallback, useEffect, useState } from 'react'

import { toBN } from 'utils/numbers'
import { useCLQDRContract, usePerpetualEscrowTokenReceiverContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { makeHttpRequest } from 'utils/http'

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

export function useFetchFirebirdData(
  amount: string
): { lqdrPrice: number; cLqdrPrice: number; convertRate: number; cLqdrAmountOut: string } | null {
  const DefaultAmount = '100'
  const [data, setData] = useState()
  const SUB_URL =
    '/fantom/route?from=0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9&to=0x814c66594a22404e101fecfecac1012d8d75c156&amount='
  const getDate = useCallback(async () => {
    try {
      const firebirdAmount = !amount || amount == '' || Number(amount) == 0 ? DefaultAmount : amount
      const amountBN = toBN(firebirdAmount).times(1e18).toFixed()
      console.log(amount, amountBN)

      const { href: url } = new URL(SUB_URL + amountBN, 'https://router.firebird.finance')
      const result = await makeHttpRequest(url)
      setData(result)
    } catch (err) {
      throw err
    }
  }, [SUB_URL, amount])

  useEffect(() => {
    getDate()
  }, [getDate])

  return useMemo(() => {
    if (!data) return null
    const maxReturn = data['maxReturn']
    const tokens = maxReturn['tokens']

    return {
      lqdrPrice: tokens['0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9']['price'],
      cLqdrPrice: tokens['0x814c66594a22404e101fecfecac1012d8d75c156']['price'],
      convertRate: toBN(maxReturn['totalFrom']).div(0.9995).div(maxReturn['totalTo']).toNumber(),
      cLqdrAmountOut: toBN(maxReturn['totalTo']).times(0.9995).div(1e18).toFixed(),
    }
  }, [data])
}
