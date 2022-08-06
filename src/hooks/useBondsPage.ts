import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { BDEI_TOKEN } from 'constants/tokens'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useDeiBonderContract } from 'hooks/useContract'
import { useOwnerBondNFTs } from 'hooks/useOwnedNfts'

import { toBN } from 'utils/numbers'
import { getRemainingTime } from 'utils/time'
import { formatBalance } from 'utils/numbers'

export type BondNFT = {
  tokenId: number
  deiAmount: null | number
  redeemTime: null | number
}

export function useBonderData(): {
  deiBonded: number
  bondingPaused: boolean
} {
  const contract = useDeiBonderContract()
  const calls = [
    {
      methodName: 'bondingPaused',
      callInputs: [],
    },
    {
      methodName: 'deiBonded',
      callInputs: [],
    },
  ]
  const [bondingPaused, deiBonded] = useSingleContractMultipleMethods(contract, calls)

  const { bondingPausedValue, deiBondedValue } = useMemo(
    () => ({
      bondingPausedValue: bondingPaused?.result ? bondingPaused?.result[0] : false,
      deiBondedValue: deiBonded?.result ? toBN(formatUnits(deiBonded.result[0], 18)).toNumber() : 0,
    }),
    [bondingPaused, deiBonded]
  )

  return {
    bondingPaused: bondingPausedValue,
    deiBonded: deiBondedValue,
  }
}

export function useGetRedeemTime(amountIn: string): {
  redeemTime: number
} {
  const contract = useDeiBonderContract()
  const amountInBN = toBN(amountIn).times(1e18).toFixed()

  const calls = [
    {
      methodName: 'getRedeemTime',
      callInputs: [amountInBN],
    },
  ]
  const [redeemTime] = useSingleContractMultipleMethods(contract, calls)

  const { redeemTimeValue } = useMemo(
    () => ({
      redeemTimeValue: redeemTime?.result ? toBN(redeemTime.result[0].toString()).times(1000).toNumber() : 0,
    }),
    [redeemTime]
  )

  return {
    redeemTime: redeemTimeValue,
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
  const userBondNFTs = useOwnerBondNFTs()
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
  bDeiBalance: number | null
  totalDeiClaimed: number | null
  claimableDei: number | null
} {
  const { account } = useWeb3React()
  const { redeemTime, deiAmount } = useUserNextMaturity()
  const bdeiCurrencyBalance = useCurrencyBalance(account ?? undefined, BDEI_TOKEN)

  return {
    redeemTime,
    deiAmount,
    bDeiBalance: bdeiCurrencyBalance ? Number(bdeiCurrencyBalance.toExact()) : null,
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
            { name: 'Your Claimable DEI', value: 'N/A' },
          ],
    [account, redeemTime, deiAmount, bDeiBalance]
  )
}
