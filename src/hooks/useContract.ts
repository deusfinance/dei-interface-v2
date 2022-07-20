import { useMemo } from 'react'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { Web3Provider } from '@ethersproject/providers'

import useWeb3React from './useWeb3'

import ERC20_ABI from 'constants/abi/ERC20.json'
import ERC20_BYTES32_ABI from 'constants/abi/ERC20'
import MULTICALL2_ABI from 'constants/abi/MULTICALL2.json'
import GENERAL_LENDER_ABI from 'constants/abi/GENERAL_LENDER.json'
import GENERAL_LENDER_V2_ABI from 'constants/abi/GENERAL_LENDER_V2.json'
import LENDER_MANAGER_ABI from 'constants/abi/LENDER_MANAGER.json'
import LENDER_ORACLE_ABI from 'constants/abi/LENDER_ORACLE.json'
import SOLIDEX_LP_DEPOSITOR_ABI from 'constants/abi/SOLIDEX_LP_DEPOSITOR.json'
import VEDEUS_ABI from 'constants/abi/VEDEUS.json'
import VDEUS_ABI from 'constants/abi/VDEUS.json'
import VE_DIST_ABI from 'constants/abi/VE_DIST.json'
import REIMBURSE_ABI from 'constants/abi/REIMBURSE.json'
import BASE_V1_FACTORY_ABI from 'constants/abi/BASE_V1_FACTORY.json'
import BASE_V1_PAIR_ABI from 'constants/abi/BASE_V1_PAIR.json'
import BASE_V1_VOTER_ABI from 'constants/abi/BASE_V1_VOTER.json'
import BASE_V1_GAUGE_ABI from 'constants/abi/BASE_V1_GAUGE.json'
import BASE_V1_BRIBE_ABI from 'constants/abi/BASE_V1_BRIBE.json'
import BASE_V1_MINTER_ABI from 'constants/abi/BASE_V1_MINTER.json'
import DYNAMIC_REDEEMER_ABI from 'constants/abi/DYNAMIC_REDEEMER.json'
import DEI_BONDER_ABI from 'constants/abi/DEI_Bonder.json'
import SWAP_ABI from 'constants/abi/SWAP_ABI.json'
import VDeusMasterChefV2_ABI from 'constants/abi/VDeusMasterChefV2_ABI.json'
import MasterChefV2_ABI from 'constants/abi/MasterChefV2_ABI.json'
import VDEUS_STAKING_ABI from 'constants/abi/VDEUS_STAKING.json'

import { Providers } from 'constants/providers'
import {
  LenderManager,
  Multicall2,
  SolidexLpDepositor,
  Reimburse,
  veDEUS,
  BaseV1Factory,
  BaseV1Voter,
  ZERO_ADDRESS,
  BaseV1Minter,
  DynamicRedeemer,
  DeiBonder,
  veDist,
  SwapFlashLoan,
  MasterChefV2,
  vDeus,
  vDeusStaking,
  vDeusMasterChefV2,
} from 'constants/addresses'
import { BorrowPool, LenderVersion } from 'state/borrow/reducer'

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

export function useGeneralLenderContract(pool: BorrowPool) {
  const ABI = pool.version == LenderVersion.V1 ? GENERAL_LENDER_ABI : GENERAL_LENDER_V2_ABI
  return useContract(pool.generalLender, ABI)
}

export function useBaseV1FactoryContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? BaseV1Factory[chainId] : undefined), [chainId])
  return useContract(address, BASE_V1_FACTORY_ABI)
}

export function useBaseV1MinterContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? BaseV1Minter[chainId] : undefined), [chainId])
  return useContract(address, BASE_V1_MINTER_ABI)
}

export function useBaseV1VoterContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? BaseV1Voter[chainId] : undefined), [chainId])
  return useContract(address, BASE_V1_VOTER_ABI)
}

export function useBaseV1PairContract(address: string) {
  return useContract(address, BASE_V1_PAIR_ABI)
}

export function useBaseV1GaugeContract(address: string) {
  return useContract(address, BASE_V1_GAUGE_ABI)
}

export function useBaseV1BribeContract(address: string) {
  return useContract(address, BASE_V1_BRIBE_ABI)
}

export function useReimburseContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? Reimburse[chainId] : undefined), [chainId])
  return useContract(address, REIMBURSE_ABI)
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

export function useOracleContract(pool: BorrowPool) {
  return useContract(pool.oracle, LENDER_ORACLE_ABI)
}

export function useSolidexLpDepositor() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? SolidexLpDepositor[chainId] : undefined), [chainId])
  return useContract(address, SOLIDEX_LP_DEPOSITOR_ABI)
}

export function useLenderManagerContract() {
  const { chainId } = useWeb3React()
  const address = useMemo(() => (chainId ? LenderManager[chainId] : undefined), [chainId])
  return useContract(address, LENDER_MANAGER_ABI)
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
