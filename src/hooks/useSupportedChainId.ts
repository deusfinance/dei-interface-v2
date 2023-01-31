import { useMemo } from 'react'
import useWeb3React from './useWeb3'
import { SolidlyChains, SupportedChainId } from 'constants/chains'

// Allow user to connect any chain globally, but restrict unsupported ones if needed
export function useSupportedChainId() {
  const { chainId, account } = useWeb3React()
  return useMemo(() => {
    if (!chainId || !account) return false
    return SolidlyChains.includes(chainId)
  }, [chainId, account])
}

export function useArbitrumSupportedChainId() {
  const { chainId, account } = useWeb3React()
  return useMemo(() => {
    if (!chainId || !account) return false
    return chainId === SupportedChainId.ARBITRUM
  }, [chainId, account])
}
