import { useMemo } from 'react'
import { arrayify } from '@ethersproject/bytes'
import { parseBytes32String } from '@ethersproject/strings'
import { Currency, NATIVE, Token, WNATIVE } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { isAddress } from 'utils/validate'
import { NEVER_RELOAD, useSingleCallResult } from 'state/multicall/hooks'
import { useBytes32TokenContract, useERC20Contract } from './useContract'
import { useTokensFromMap } from './useTokenList'

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue
}

export function useToken(tokenAddress?: string | null): Token | null | undefined {
  const { chainId } = useWeb3React()
  const tokens = useTokensFromMap()

  const address = isAddress(tokenAddress)

  const tokenContract = useERC20Contract(address ? address : undefined, false)
  const tokenContractBytes32 = useBytes32TokenContract(address ? address : undefined, false)
  const token: Token | undefined = address ? tokens[address] : undefined

  const tokenName = useSingleCallResult(token ? undefined : tokenContract, 'name', undefined, NEVER_RELOAD)
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD
  )
  const symbol = useSingleCallResult(token ? undefined : tokenContract, 'symbol', undefined, NEVER_RELOAD)
  const symbolBytes32 = useSingleCallResult(token ? undefined : tokenContractBytes32, 'symbol', undefined, NEVER_RELOAD)
  const decimals = useSingleCallResult(token ? undefined : tokenContract, 'decimals', undefined, NEVER_RELOAD)

  return useMemo(() => {
    if (token) return token
    if (tokenAddress === null) return null
    if (!chainId || !address) return undefined
    if (decimals.loading || symbol.loading || tokenName.loading) return null
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(symbol.result?.[0], symbolBytes32.result?.[0], 'UNKNOWN'),
        parseStringOrBytes32(tokenName.result?.[0], tokenNameBytes32.result?.[0], 'Unknown Token')
      )
    }
    return undefined
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenAddress,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ])
}

export function useCurrency(currencyId?: string | null): Currency | null | undefined {
  const { chainId } = useWeb3React()
  const isETH = currencyId?.toUpperCase() === 'ETH'
  const token = useToken(isETH ? undefined : currencyId)

  const { native, wnative } = useMemo(
    () => ({
      // @ts-ignore TYPE NEEDS FIXING
      native: chainId && chainId in NATIVE ? NATIVE[chainId] : undefined,
      wnative: chainId && chainId in WNATIVE ? WNATIVE[chainId] : undefined,
    }),
    [chainId]
  )

  if (wnative?.address?.toLowerCase() === currencyId?.toLowerCase()) return wnative

  return isETH ? native : token
}
