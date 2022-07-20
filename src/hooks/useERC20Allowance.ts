import { useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Token } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { useERC20Contract } from './useContract'
import { useSingleCallResult } from 'state/multicall/hooks'

export default function useERC20Allowance(token: Token | undefined, spender: string | undefined): BigNumber {
  const { account } = useWeb3React()
  const [cachedResult, setCachedResult] = useState(BigNumber.from('0'))
  const contract = useERC20Contract(token?.address, true)

  const inputs = useMemo(() => [account ?? undefined, spender ?? undefined], [account, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs)

  return useMemo(() => {
    const loading = !token || allowance.loading || !allowance.result || allowance.syncing
    if (loading) {
      return cachedResult
    }
    setCachedResult(allowance.result[0])
    return allowance.result[0]
  }, [token, allowance, cachedResult])
}
