import { useCallback, useMemo } from 'react'
import BN from 'bignumber.js'
import toast from 'react-hot-toast'

import useWeb3React from './useWeb3'
import { useProxyMinterContract } from './useContract'
import { Collateral } from 'constants/addresses'
import { MINT__PATHS } from 'constants/path'
import { ProxyValues } from 'state/mint/reducer'
import { ParseProxyMinterGetAmountOutError } from 'utils/parseErrors'

type Params = Array<string | string[]>

enum CallMethods {
  ERC20 = 'getERC202DEIInputs',
  USDC = 'getUSDC2DEIInputs',
}

export default function useProxiedAmountOutCallback(
  address: string | undefined,
  decimals: number | undefined,
  symbol: string | undefined,
  collateralPrice: BN,
  deusPrice: BN
) {
  const { chainId } = useWeb3React()
  const ProxyMinterContract = useProxyMinterContract()

  const method = useMemo(() => {
    return address == Collateral[chainId ?? 1] ? CallMethods.USDC : CallMethods.ERC20
  }, [chainId, address])

  const getParams = useCallback(
    (inputAmount: BN): Params | null => {
      if (inputAmount.isZero() || collateralPrice.isZero() || deusPrice.isZero()) return null
      if (!chainId || !address || !decimals || !symbol) return null

      const params: Params = [
        inputAmount.times(new BN(10).pow(decimals)).toFixed(0),
        deusPrice.times(new BN(10).pow(6)).toFixed(0),
        collateralPrice.times(new BN(10).pow(6)).toFixed(0),
      ]

      const path = MINT__PATHS[chainId][symbol]
      if (method == CallMethods.ERC20) {
        if (!path) {
          console.error('Unable to find a proxy path for: ', address)
          return params
        }
        params.push(path)
      }
      return params
    },
    [chainId, address, decimals, symbol, method, collateralPrice, deusPrice]
  )

  return useCallback(
    async (inputAmount: BN) => {
      try {
        const params = getParams(inputAmount)
        if (!ProxyMinterContract || !params) return null
        const result: ProxyValues = await ProxyMinterContract[method](...params)
        return result
      } catch (err) {
        toast.error(ParseProxyMinterGetAmountOutError(err))
        return null
      }
    },
    [method, getParams, ProxyMinterContract]
  )
}
