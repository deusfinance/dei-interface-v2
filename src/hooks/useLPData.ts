import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'

import { BorrowPool } from 'state/borrow/reducer'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSolidexLpDepositor } from './useContract'
import useWeb3React from './useWeb3'

export function useLPData(pool: BorrowPool, userHolder: string) {
  const { account } = useWeb3React()
  const contract = useSolidexLpDepositor()
  const balanceCalls = useMemo(
    () =>
      !account || !userHolder
        ? []
        : [
            {
              methodName: 'pendingRewards',
              callInputs: [userHolder, [pool.lpPool]], //TODO: needs to be array of user pool to get all claimable amounts
            },
          ],
    [account, pool, userHolder]
  )

  const [balances] = useSingleContractMultipleMethods(contract, balanceCalls)

  return useMemo(
    () => ({
      balance0:
        balanceCalls.length && balances?.result?.pending ? formatUnits(balances.result.pending[0].solid, 18) : '0',
      balance1:
        balanceCalls.length && balances && balances?.result?.pending
          ? formatUnits(balances.result.pending[0].sex, 18)
          : '0',
    }),
    [balanceCalls, balances]
  )
}
