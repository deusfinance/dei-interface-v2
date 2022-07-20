import { useCallback, useEffect, useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { TransactionResponse } from '@ethersproject/providers'

import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import { useSingleCallResult } from 'state/multicall/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useContract } from 'hooks/useContract'
import { toBN } from 'utils/numbers'
import { calculateGasMargin } from 'utils/web3'
import VDEUS_ABI from 'constants/abi/VDEUS.json'
import { ZERO_ADDRESS } from 'constants/addresses'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export function useERC721ApproveForAll(
  tokenAddress: string | null | undefined,
  spender: string | null | undefined
): boolean {
  const { account } = useWeb3React()
  const [cachedResult, setCachedResult] = useState(false)
  const ERC721Contract = useContract(tokenAddress, VDEUS_ABI)
  const inputs = useMemo(() => [account ?? undefined, spender ?? undefined], [account, spender])
  const approvedAll = useSingleCallResult(ERC721Contract, 'isApprovedForAll', inputs)

  return useMemo(() => {
    const loading = !tokenAddress || approvedAll.loading || !approvedAll.result || approvedAll.syncing
    if (loading) {
      return cachedResult
    }
    setCachedResult(approvedAll.result[0])
    return approvedAll.result[0]
  }, [tokenAddress, approvedAll, cachedResult])
}

export function useERC721GetApprove(tokenAddress: string | null | undefined, tokenId: BigNumber.Value): string {
  const [cachedResult, setCachedResult] = useState(ZERO_ADDRESS)
  const ERC721Contract = useContract(tokenAddress, VDEUS_ABI)
  const inputs = useMemo(() => [toBN(tokenId).toString() ?? undefined], [tokenId])
  const getApproved = useSingleCallResult(ERC721Contract, 'getApproved', inputs)

  return useMemo(() => {
    const loading = !tokenAddress || getApproved.loading || !getApproved.result || getApproved.syncing
    if (loading) {
      return cachedResult
    }
    setCachedResult(getApproved.result[0])
    return getApproved.result[0]
  }, [tokenAddress, getApproved, cachedResult])
}

export default function useApproveNftCallback(
  tokenId: BigNumber.Value,
  tokenAddress: string | null | undefined,
  spender: string | null | undefined
): [ApprovalState, () => Promise<void>] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN)
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)
  const ERC721Contract = useContract(tokenAddress, VDEUS_ABI)
  const approvedAll = useERC721ApproveForAll(tokenAddress, spender)
  const approvedAddress = useERC721GetApprove(tokenAddress, tokenId)

  useEffect(() => {
    const fn = async () => {
      if (!spender || !ERC721Contract) return
      if (approvedAddress === spender || (approvedAddress === ZERO_ADDRESS && approvedAll)) {
        setApprovalState(ApprovalState.APPROVED)
      } else {
        setApprovalState(pendingApproval ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED)
      }
    }
    fn()
  }, [spender, pendingApproval, ERC721Contract, tokenId, account, approvedAddress, approvedAll])

  const approveCallback = useCallback(async () => {
    if (approvalState === ApprovalState.APPROVED || approvalState === ApprovalState.PENDING) {
      console.error('approve was called unnecessarily')
      return
    }

    if (!chainId) {
      console.error('no chainId')
      return
    }

    if (!ERC721Contract) {
      console.error('NFT Contract is null')
      return
    }

    if (!tokenAddress) {
      console.error('tokenAddress is null')
      return
    }

    if (!account) {
      console.error('account is null')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }
    const estimatedGas = await ERC721Contract.estimateGas.approve(spender, tokenId)
    return ERC721Contract.approve(spender, tokenId, {
      gasLimit: calculateGasMargin(estimatedGas),
    })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve #' + tokenId,
          approval: { tokenAddress, spender },
        })
      })
      .catch((error: Error) => {
        console.error('Failed to approve token for an unknown reason', error)
      })
  }, [approvalState, chainId, ERC721Contract, tokenAddress, account, spender, tokenId, addTransaction])

  return [approvalState, approveCallback]
}

export function useERC721ApproveAllCallback(
  tokenAddress: string | null | undefined,
  spender: string | null | undefined
): [ApprovalState, () => Promise<void>] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN)
  const ERC721Contract = useContract(tokenAddress, VDEUS_ABI)
  const approvedAll = useERC721ApproveForAll(tokenAddress, spender)

  useEffect(() => {
    const fn = async () => {
      if (!spender || !ERC721Contract) return
      if (approvedAll) {
        setApprovalState(ApprovalState.APPROVED)
      } else {
        setApprovalState(ApprovalState.NOT_APPROVED)
      }
    }
    fn()
  }, [spender, ERC721Contract, account, approvedAll])

  const approveCallback = useCallback(async () => {
    if (approvalState === ApprovalState.APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }

    if (!chainId) {
      console.error('no chainId')
      return
    }

    if (!ERC721Contract) {
      console.error('NFT Contract is null')
      return
    }

    if (!tokenAddress) {
      console.error('tokenAddress is null')
      return
    }

    if (!account) {
      console.error('account is null')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }
    const estimatedGas = await ERC721Contract.estimateGas.setApprovalForAll(spender, true)
    return ERC721Contract.setApprovalForAll(spender, true, {
      gasLimit: calculateGasMargin(estimatedGas),
    })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Set Approve All',
          approval: { tokenAddress, spender },
        })
      })
      .catch((error: Error) => {
        console.error('Failed to approve token for an unknown reason', error)
      })
  }, [approvalState, chainId, ERC721Contract, tokenAddress, account, spender, addTransaction])

  return [approvalState, approveCallback]
}
