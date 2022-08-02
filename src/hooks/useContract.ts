import { useMemo } from 'react'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { Web3Provider } from '@ethersproject/providers'

import useWeb3React from './useWeb3'

import ERC20_ABI from 'constants/abi/ERC20.json'
import ERC20_BYTES32_ABI from 'constants/abi/ERC20'
import MULTICALL2_ABI from 'constants/abi/MULTICALL2.json'
import VEDEUS_ABI from 'constants/abi/VEDEUS.json'
import VDEUS_ABI from 'constants/abi/VDEUS.json'
import VE_DIST_ABI from 'constants/abi/VE_DIST.json'
import DYNAMIC_REDEEMER_ABI from 'constants/abi/DYNAMIC_REDEEMER.json'
import DEI_BONDER_ABI from 'constants/abi/DEI_Bonder.json'
import SWAP_ABI from 'constants/abi/SWAP_ABI.json'
import VDeusMasterChefV2_ABI from 'constants/abi/VDeusMasterChefV2_ABI.json'
import MasterChefV2_ABI from 'constants/abi/MasterChefV2_ABI.json'
import VDEUS_STAKING_ABI from 'constants/abi/VDEUS_STAKING.json'
import COLLATERAL_POOL_ABI from 'constants/abi/COLLATERAL_POOL_ABI.json'
import PROXY_MINTER_ABI from 'constants/abi/PROXY_MINTER_ABI.json'
import ORACLE_ABI from 'constants/abi/ORACLE_ABI.json'

import { Providers } from 'constants/providers'
import {
  Multicall2,
  veDEUS,
  ZERO_ADDRESS,
  DynamicRedeemer,
  DeiBonder,
  veDist,
  SwapFlashLoan,
  MasterChefV2,
  vDeus,
  vDeusStaking,
  vDeusMasterChefV2,
  CollateralPool,
  MintProxy,
} from 'constants/addresses'

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | null | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { library, account, chainId } = useWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address || address === ZERO_ADDRESS) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function getProviderOrSigner(library: any, account?: string): any {
  return account ? getSigner(library, account) : library
}

export function getSigner(library: any, account: string): any {
  return library.getSigner(account).connectUnchecked()
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string,
  targetChainId?: number
): Contract | null {
  if (!isAddress(address) || address === AddressZero) {
    throw new Error(`Invalid 'address' parameter '${address}'.`)
  }

  let providerOrSigner
  if (targetChainId) {
    providerOrSigner = getProviderOrSigner(Providers[targetChainId], account)
  } else {
    providerOrSigner = getProviderOrSigner(library, account)
  }

  return new Contract(address, ABI, providerOrSigner) as any
}

export function useERC20Contract(tokenAddress: string | null | undefined, withSignerIfPossible?: boolean) {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useVeDeusContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDEUS[chainId] : undefined), [chainId])
  return useContract(address, VEDEUS_ABI)
}

export function useVDeusContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? vDeus[chainId] : undefined), [chainId])
  return useContract(address, VDEUS_ABI)
}

export function useVeDistContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? veDist[chainId] : undefined), [chainId])
  return useContract(address, VE_DIST_ABI)
}

export function useMulticall2Contract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? Multicall2[chainId] : undefined), [chainId])
  return useContract(address, MULTICALL2_ABI)
}

export function useDynamicRedeemerContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  return useContract(address, DYNAMIC_REDEEMER_ABI)
}

export function useDeiBonderContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DeiBonder[chainId] : undefined), [chainId])
  return useContract(address, DEI_BONDER_ABI)
}

export function useDeiSwapContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? SwapFlashLoan[chainId] : undefined), [chainId])
  return useContract(address, SWAP_ABI)
}

export function useMasterChefV2Contract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? MasterChefV2[chainId] : undefined), [chainId])
  return useContract(address, MasterChefV2_ABI)
}
export function useVDeusMasterChefV2Contract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? vDeusMasterChefV2[chainId] : undefined), [chainId])
  return useContract(address, VDeusMasterChefV2_ABI)
}

export function useVDeusStakingContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? vDeusStaking[chainId] : undefined), [chainId])
  return useContract(address, VDEUS_STAKING_ABI)
}

export function useCollateralPoolContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? CollateralPool[chainId] : undefined), [chainId])
  return useContract(address, COLLATERAL_POOL_ABI)
}

export function useProxyMinterContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? MintProxy[chainId] : undefined), [chainId])
  return useContract(address, PROXY_MINTER_ABI)
}

export function useDeiContract() {
  // FIXME: add dei contract address
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? MintProxy[chainId] : undefined), [chainId])
  return useContract(address, PROXY_MINTER_ABI)
}

export function useOracleContract(address: string) {
  return useContract(address, ORACLE_ABI)
}
