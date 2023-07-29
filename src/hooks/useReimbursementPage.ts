import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useReimbursementContract } from 'hooks/useContract'
import { DEUS_TOKEN } from 'constants/tokens'
import { BN_ZERO, toBN } from 'utils/numbers'
// import useWeb3React from './useWeb3'
import useDebounce from './useDebounce'
import { isAddress } from 'utils/address'

export function useGetClaimedData(account: string) {
  const contract = useReimbursementContract()
  // const { account } = useWeb3React()

  const call = useMemo(
    () =>
      !isAddress(account)
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
            {
              methodName: 'claimedDeiAmount',
              callInputs: [account],
            },
            {
              methodName: 'claimableDeiAmount',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [claimedDeusAmount, claimedCollateralAmount, claimedDeiAmount, claimableDeiAmount] =
    useSingleContractMultipleMethods(contract, call)
  const isLoading = useDebounce(claimedDeusAmount?.loading || claimedCollateralAmount?.loading, 500)

  const claimedDeusAmountRes =
    !claimedDeusAmount || !claimedDeusAmount.result
      ? BN_ZERO
      : toBN(formatUnits(claimedDeusAmount?.result[0].toString(), DEUS_TOKEN.decimals)).toString()

  const claimedCollateralAmountRes =
    !claimedCollateralAmount || !claimedCollateralAmount.result
      ? BN_ZERO
      : toBN(formatUnits(claimedCollateralAmount?.result[0].toString(), DEUS_TOKEN.decimals)).toString()

  const claimedDeiAmountRes =
    !claimedDeiAmount || !claimedDeiAmount.result
      ? BN_ZERO
      : toBN(formatUnits(claimedDeiAmount?.result[0].toString(), DEUS_TOKEN.decimals)).toString()

  const claimableDeiAmountRes =
    !claimableDeiAmount || !claimableDeiAmount.result
      ? BN_ZERO
      : toBN(formatUnits(claimableDeiAmount?.result[0].toString(), DEUS_TOKEN.decimals))

  return {
    claimedCollateralAmount: claimedCollateralAmountRes,
    claimedDeusAmount: claimedDeusAmountRes,
    claimedDeiAmount: claimedDeiAmountRes,
    claimableDeiAmount: claimableDeiAmountRes,
    isLoading,
  }
}

export function useGetReimburseRatio() {
  const contract = useReimbursementContract()

  const call = useMemo(
    () => [
      {
        methodName: 'reimburseRatio',
        callInputs: [],
      },
      {
        methodName: 'deiReimburseRatio',
        callInputs: [],
      },
    ],
    []
  )

  const [reimburseRatio, deiReimburseRatio] = useSingleContractMultipleMethods(contract, call)

  const reimburseRatioRes = !reimburseRatio || !reimburseRatio.result ? '602500' : reimburseRatio.result[0].toString()

  const deiReimburseRatioRes =
    !deiReimburseRatio || !deiReimburseRatio.result ? '710000' : deiReimburseRatio.result[0].toString()

  return { reimburseRatio: reimburseRatioRes, deiReimburseRatio: deiReimburseRatioRes }
}
