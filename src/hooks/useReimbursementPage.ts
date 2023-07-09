import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useReimbursementContract } from 'hooks/useContract'
import { DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { BN_ZERO, toBN } from 'utils/numbers'
import useWeb3React from './useWeb3'
import useDebounce from './useDebounce'

export function useGetClaimedData() {
  const contract = useReimbursementContract()
  const { account } = useWeb3React()

  const call = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'claimedDeusAmount',
              callInputs: [account],
            },
            {
              methodName: 'claimedCollateralAmount',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [claimedDeusAmount, claimedCollateralAmount] = useSingleContractMultipleMethods(contract, call)
  const isLoading = useDebounce(claimedDeusAmount?.loading || claimedCollateralAmount?.loading, 500)

  const claimedDeusAmountRes =
    !claimedDeusAmount || !claimedDeusAmount.result
      ? BN_ZERO
      : toBN(formatUnits(claimedDeusAmount?.result[0].toString(), DEUS_TOKEN.decimals)).toString()

  const claimedCollateralAmountRes =
    !claimedCollateralAmount || !claimedCollateralAmount.result
      ? BN_ZERO
      : toBN(formatUnits(claimedCollateralAmount?.result[0].toString(), USDC_TOKEN.decimals)).toString()

  return {
    claimedCollateralAmount: claimedCollateralAmountRes,
    claimedDeusAmount: claimedDeusAmountRes,
    isLoading,
  }
}

export function useGetReimburseRatio(): string {
  const contract = useReimbursementContract()

  const call = useMemo(
    () => [
      {
        methodName: 'reimburseRatio',
        callInputs: [],
      },
    ],
    []
  )

  const [reimburseRatioRes] = useSingleContractMultipleMethods(contract, call)

  return !reimburseRatioRes || !reimburseRatioRes.result ? '' : reimburseRatioRes.result[0].toString()
}
