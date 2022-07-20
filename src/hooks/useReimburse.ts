import { useMemo } from 'react'
import { useReimburseContract } from 'hooks/useContract'
import useWeb3React from 'hooks/useWeb3'
import { AddressZero } from '@ethersproject/constants'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSupportedChainId } from 'hooks/useSupportedChainId'

export function useReimburse(): {
  userHolder: string
} {
  const { account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const reimburseContract = useReimburseContract()
  const calls = useMemo(
    () =>
      !account || !isSupportedChainId
        ? []
        : [
            {
              methodName: 'userHolder',
              callInputs: [account],
            },
          ],
    [account, isSupportedChainId]
  )

  const [userHolder] = useSingleContractMultipleMethods(reimburseContract, calls)
  const userHolderAddress = useMemo(
    () => (calls.length && userHolder?.result ? userHolder?.result[0].toString() : AddressZero),
    [calls, userHolder]
  )

  return useMemo(
    () => ({
      userHolder: userHolderAddress,
    }),
    [userHolderAddress]
  )
}
