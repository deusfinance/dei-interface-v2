import { useMemo } from 'react'

import { BN_ZERO, toBN } from 'utils/numbers'
import { getRemainingTime } from 'utils/time'
import { formatBalance } from 'utils/numbers'
import { ZERO_ADDRESS } from 'constants/addresses'
import { BDEI_TOKEN } from 'constants/tokens'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useDeiBonderContract, useDeiBonderV3Contract } from 'hooks/useContract'
import { useOwnerBondNFTs } from 'hooks/useOwnerNfts'
import BigNumber from 'bignumber.js'

export type BondNFT = {
  tokenId: number
  deiAmount: null | number
  redeemTime: null | number
}

export function useBonderData(): {
  bondingPaused: boolean
  oracle: string
} {
  const contract = useDeiBonderContract()
  const calls = [
    {
      methodName: 'paused',
      callInputs: [],
    },
    {
      methodName: 'oracle',
      callInputs: [],
    },
  ]
  const [bondingPaused, oracleResp] = useSingleContractMultipleMethods(contract, calls)

  const { bondingPausedValue, oracleAddress } = useMemo(
    () => ({
      bondingPausedValue: bondingPaused?.result ? bondingPaused?.result[0] : false,
      oracleAddress: oracleResp?.result ? oracleResp?.result[0] : ZERO_ADDRESS,
    }),
    [bondingPaused, oracleResp]
  )

  return {
    bondingPaused: bondingPausedValue,
    oracle: oracleAddress,
  }
}

export function useUserClaimableDEI(): {
  claimedDEI: BigNumber
} {
  const contract = useDeiBonderV3Contract()
  const { account } = useWeb3React()

  const calls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'claimableDEI',
              callInputs: [account],
            },
          ],
    [account]
  )
  const [claimableDEI] = useSingleContractMultipleMethods(contract, calls)

  const { claimableDEIValue } = useMemo(
    () => ({
      claimableDEIValue: claimableDEI?.result ? toBN(claimableDEI.result[0].toString()).div(18) : BN_ZERO,
    }),
    [claimableDEI]
  )

  return {
    claimedDEI: claimableDEIValue,
  }
}

export function useBondsAmountsOut(amountIn: string): {
  amountOut: string
} {
  const amountOut = amountIn
  return {
    amountOut,
  }
}

export function useUserBondNFTs(): BondNFT[] {
  const { results: userBondNFTs } = useOwnerBondNFTs()
  const DeiBonderContract = useDeiBonderContract()

  const call = useMemo(() => {
    return userBondNFTs.map((tokenId) => ({ methodName: 'bondRedeems', callInputs: [tokenId] }))
  }, [userBondNFTs])

  const result = useSingleContractMultipleMethods(DeiBonderContract, call)

  return useMemo(() => {
    return result.map((item, index) => ({
      tokenId: userBondNFTs[index],
      deiAmount: item.result ? toBN(item.result['deiAmount'].toString()).div(1e18).toNumber() : null,
      redeemTime: item.result ? toBN(item.result['redeemTime'].toString()).times(1000).toNumber() : null,
    }))
  }, [result, userBondNFTs])
}

export function useUserNextMaturity(): {
  redeemTime: number | null
  deiAmount: number | null
} {
  const nfts = useUserBondNFTs()
  let redeemTime = 0
  let deiAmount = 0
  if (!nfts.length) return { redeemTime: null, deiAmount: null }
  for (let i = 0; nfts.length > i; i++) {
    if (nfts[i].deiAmount === null || nfts[i].redeemTime === null) return { redeemTime: null, deiAmount: null }
    const { day, diff } = getRemainingTime(nfts[i]?.redeemTime ?? 0)
    if (diff > 0 && !redeemTime) {
      redeemTime = day
      deiAmount = nfts[i]?.deiAmount ?? 0
    }
  }
  return { redeemTime, deiAmount }
}

export function useUserBondStats(): {
  redeemTime: number | null
  deiAmount: number | null
  bDeiBalance: BigNumber | null
  totalDeiClaimed: number | null
  claimableDei: number | null
} {
  const { account } = useWeb3React()
  const { redeemTime, deiAmount } = useUserNextMaturity()
  const bdeiCurrencyBalance = useCurrencyBalance(account ?? undefined, BDEI_TOKEN)

  return {
    redeemTime,
    deiAmount,
    bDeiBalance: bdeiCurrencyBalance ? toBN(bdeiCurrencyBalance.toExact()) : null,
    totalDeiClaimed: 0,
    claimableDei: 0,
  }
}

export function useUserDeiBondInfo(): { name: string; value: number | string }[] {
  const { account } = useWeb3React()
  const { redeemTime, deiAmount, bDeiBalance } = useUserBondStats()

  return useMemo(
    () =>
      !account
        ? []
        : [
            {
              name: 'Your bDEI Balance',
              value: bDeiBalance ? formatBalance(bDeiBalance, 2) + ' bDEI' : 'N/A',
            },
            { name: 'Next Maturity Amount', value: deiAmount ? `${formatBalance(deiAmount, 6)} bDEI` : 'N/A' },
            { name: 'Next Maturity Time', value: redeemTime ? `in ${redeemTime?.toFixed(0)} days` : 'N/A' },
          ],
    [account, redeemTime, deiAmount, bDeiBalance]
  )
}
