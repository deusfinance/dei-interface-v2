import { useMemo } from 'react'

import { useWalletModalToggle } from 'state/application/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import useWeb3React from 'hooks/useWeb3'

import { PrimaryButton } from 'components/Button'
import { SupportedChainId } from 'constants/chains'

export enum ContextError {
  ACCOUNT,
  CHAIN_ID,
  VALID,
}

export function useInvalidContext() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  return useMemo(
    () =>
      !account || !chainId ? ContextError.ACCOUNT : !isSupportedChainId ? ContextError.CHAIN_ID : ContextError.VALID,
    [account, chainId, isSupportedChainId]
  )
}

export function InvalidContext({ connectText }: { connectText?: string }) {
  const invalidContext = useInvalidContext()
  const toggleWalletModal = useWalletModalToggle()
  const rpcChangerCallback = useRpcChangerCallback()

  return useMemo(() => {
    if (invalidContext === ContextError.ACCOUNT) {
      return (
        <>
          <div>{connectText ?? 'Connect your Wallet'}</div>
          <PrimaryButton onClick={toggleWalletModal}>Connect Wallet</PrimaryButton>
        </>
      )
    }
    if (invalidContext === ContextError.CHAIN_ID) {
      return (
        <>
          <div>You are not connected to the Fantom Opera Network.</div>
          <PrimaryButton onClick={() => rpcChangerCallback(SupportedChainId.FANTOM)}>Switch to Fantom</PrimaryButton>
        </>
      )
    }
    return null
  }, [invalidContext, connectText, rpcChangerCallback, toggleWalletModal])
}
