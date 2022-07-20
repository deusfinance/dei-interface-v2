import { useCallback, useEffect, useState } from 'react'

import useWeb3React from './useWeb3'

import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import BigNumber from 'bignumber.js'
import { AddressZero } from '@ethersproject/constants/src.ts/addresses'
import { calculateGasMargin } from 'utils/web3'
import { TransactionResponse } from '@ethersproject/providers'
import { useContract } from './useContract'
import VDEUS_ABI from 'constants/abi/VDEUS.json'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export default function useApproveNftCallback(
  tokenId: BigNumber.Value,
  tokenAddress: string | null | undefined,
  spender: string | null | undefined
): [ApprovalState, () => Promise<void>] {
  const { chainId, account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.UNKNOWN)
  const [approvedAll, setApprovedAll] = useState(false)

  const pendingApproval = useHasPendingApproval(tokenAddress, spender)
  const ERC721Contract = useContract(tokenAddress, VDEUS_ABI)

  useEffect(() => {
    const fn = async () => {
      if (!spender || !ERC721Contract) return
      const approvedAll = await ERC721Contract.isApprovedForAll(account, spender)
      setApprovedAll(approvedAll)
    }
    fn()
  }, [spender, pendingApproval, ERC721Contract, tokenId, account])

  useEffect(() => {
    const fn = async () => {
      if (!spender || !ERC721Contract) return
      const approvedAddress = await ERC721Contract.getApproved(tokenId)
      if (approvedAddress === spender || (approvedAddress === AddressZero && approvedAll)) {
        setApprovalState(ApprovalState.APPROVED)
      } else {
        setApprovalState(pendingApproval ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED)
      }
    }
    fn()
  }, [spender, pendingApproval, ERC721Contract, tokenId, account, approvedAll])

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
