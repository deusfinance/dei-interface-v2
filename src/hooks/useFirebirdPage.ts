import { Token } from '@sushiswap/core-sdk'
import { useMemo, useCallback, useEffect, useState } from 'react'
import { makeHttpRequest } from 'utils/http'
import { toBN } from 'utils/numbers'

export function useFetchFirebirdData(
  amount: string,
  inputToken: Token,
  outputToken: Token
): { inputTokenPrice: number; outputTokenPrice: number; convertRate: number; outputTokenAmount: string } | null {
  const DefaultAmount = '100'
  const [data, setData] = useState()
  const SUB_URL = `/fantom/route?from=${inputToken.address}&to=${outputToken.address}&amount=`
  const getDate = useCallback(async () => {
    try {
      const firebirdAmount = !amount || amount == '' || Number(amount) == 0 ? DefaultAmount : amount
      const amountBN = toBN(firebirdAmount)
        .times(10 ** inputToken.decimals)
        .toFixed()

      const { href: url } = new URL(SUB_URL + amountBN, 'https://router.firebird.finance')
      const result = await makeHttpRequest(url)
      setData(result)
    } catch (err) {
      throw err
    }
  }, [SUB_URL, amount, inputToken])

  useEffect(() => {
    getDate()
  }, [getDate])

  return useMemo(() => {
    if (!data) return null
    const maxReturn = data['maxReturn']
    const tokens = maxReturn['tokens']

    return {
      //   inputTokenPrice: tokens[`${inputToken.address}`]['price'],
      //   outputTokenPrice: tokens[`${outputToken.address}`]['price'],
      inputTokenPrice: 0,
      outputTokenPrice: 0,
      convertRate: toBN(maxReturn['totalFrom']).div(0.9995).div(maxReturn['totalTo']).toNumber(),
      outputTokenAmount: toBN(maxReturn['totalTo'])
        .times(0.9995)
        .div(10 ** outputToken.decimals)
        .toFixed(),
    }
  }, [data])
}
