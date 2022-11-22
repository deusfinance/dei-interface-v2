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
import VE_DIST_ABI from 'constants/abi/VE_DIST.json'
import DEI_BONDER_ABI from 'constants/abi/DEI_Bonder.json'
import COLLATERAL_POOL_ABI from 'constants/abi/COLLATERAL_POOL_ABI.json'
import PROXY_MINTER_ABI from 'constants/abi/PROXY_MINTER_ABI.json'
import DEI_BONDER_V3_ABI from 'constants/abi/DEI_BONDER_V3.json'
import CLQDR_ABI from 'constants/abi/CLQDR_ABI.json'
import CLQDR_FULL_ABI from 'constants/abi/CLQDR_FULL_ABI.json'
import TWAP_ORACLE_ABI from 'constants/abi/TWAP_ORACLE.json'
import ORACLE_ABI from 'constants/abi/ORACLE_ABI.json'
import DEIStrategy from 'constants/abi/DEIStrategy.json'
import MasterChefV2_ABI from 'constants/abi/MasterChefV2.json'
import SWAP_ABI from 'constants/abi/SWAP_ABI.json'

import { Providers } from 'constants/providers'
import {
  Multicall2,
  veDEUS,
  ZERO_ADDRESS,
  DeiBonder,
  veDist,
  CollateralPool,
  MintProxy,
  TwapOracle,
  DeiBonderV3,
  CLQDR_ADDRESS,
  AnyDEI_ADDRESS,
} from 'constants/addresses'
import { StakingType } from 'constants/stakingPools'
import { StablePoolType } from 'constants/sPools'

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

export function useDeiBonderContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DeiBonder[chainId] : undefined), [chainId])
  return useContract(address, DEI_BONDER_ABI)
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

// FIXME: add dei contract address
export function useDeiContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? MintProxy[chainId] : undefined), [chainId])
  return useContract(address, PROXY_MINTER_ABI)
}

export function useOracleContract(address: string) {
  return useContract(address, ORACLE_ABI)
}

export function useStrategyContract(address: string) {
  return useContract(address, DEIStrategy)
}

export function useTwapOracleContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? TwapOracle[chainId] : undefined), [chainId])
  return useContract(address, TWAP_ORACLE_ABI)
}

export function useDeiBonderV3Contract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? DeiBonderV3[chainId] : undefined), [chainId])
  return useContract(address, DEI_BONDER_V3_ABI)
}

export function useCLQDRContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? CLQDR_ADDRESS[chainId] : undefined), [chainId])
  return useContract(address, CLQDR_ABI)
}

export function usePerpetualEscrowTokenReceiverContract() {
  const address = '0xcd3563cd8de2602701d5d9f960db30710fcc4053'
  return useContract(address, CLQDR_FULL_ABI)
}

export function useAnyDEIContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? AnyDEI_ADDRESS[chainId] : undefined), [chainId])
  return useContract(address, ERC20_ABI)
}

export function useMasterChefContract(stakingPool: StakingType) {
  const address = useMemo(() => (stakingPool ? stakingPool.masterChef : undefined), [stakingPool])
  return useContract(address, MasterChefV2_ABI)
}

export function useStablePoolContract(pool: StablePoolType) {
  const address = useMemo(() => (pool ? pool.swapFlashLoan : undefined), [pool])
  return useContract(address, SWAP_ABI)
}
