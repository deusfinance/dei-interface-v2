import { useEffect, useMemo, useState } from 'react'
import { formatUnits } from '@ethersproject/units'

import { escrow, USDCReserves1 } from 'constants/addresses'
import { DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { toBN } from 'utils/numbers'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useAnyDEIContract, useERC20Contract } from 'hooks/useContract'
import { CollateralPool } from '../constants/addresses'
import { useUnclaimedCollateralAmount } from '../state/dei/hooks'
import { useGetCollateralRatios } from 'hooks/useRedemptionPage'
import { makeHttpRequest } from 'utils/http'

const DEI_RESERVES_API = 'https://info.deus.finance/info/dei/reserves'

export function useDeiStats(): {
  totalSupply: number
  escrowReserve: number
  circulatingSupply: number
  usdcPoolReserves: number
  totalUSDCReserves: number
  collateralRatio: number
  multiSigReserves: number
  usdcReserves1: number
  seigniorage: number
} {
  const deiContract = useERC20Contract(DEI_TOKEN.address)
  const usdcContract = useERC20Contract(USDC_TOKEN.address)
  const collateralPoolAddress = CollateralPool[SupportedChainId.FANTOM]
  const usdcReserves1Address = USDCReserves1[SupportedChainId.FANTOM]
  const escrowAddress = escrow[SupportedChainId.FANTOM]
  const unclaimedCollateralAmount = useUnclaimedCollateralAmount()
  const anyDEIContract = useAnyDEIContract()
  const [totalUSDCReserves, setTotalUSDCReserves] = useState(0)

  const anyDEIcall = useMemo(
    () => [
      {
        methodName: 'balanceOf',
        callInputs: ['0xEf6b0872CfDF881Cf9Fe0918D3FA979c616AF983'],
      },
    ],
    []
  )
  const [anyDEIBalance] = useSingleContractMultipleMethods(anyDEIContract, anyDEIcall)

  const { AnyDEIReserve } = useMemo(
    () => ({
      AnyDEIReserve: anyDEIBalance?.result ? toBN(formatUnits(anyDEIBalance?.result[0], 18)).toNumber() : 0,
    }),
    [anyDEIBalance?.result]
  )

  const calls = !deiContract
    ? []
    : [
        {
          methodName: 'totalSupply',
          callInputs: [],
        },
      ]

  const [totalSupplyDEI] = useSingleContractMultipleMethods(deiContract, calls)

  const { totalSupplyDEIValueRaw } = useMemo(() => {
    return {
      totalSupplyDEIValueRaw: totalSupplyDEI?.result ? toBN(formatUnits(totalSupplyDEI.result[0], 18)).toNumber() : 0,
    }
  }, [totalSupplyDEI?.result])

  const totalSupplyDEIValue = useMemo(() => {
    return totalSupplyDEIValueRaw
  }, [totalSupplyDEIValueRaw])

  const circulatingSupply = useMemo(() => {
    return totalSupplyDEIValue - AnyDEIReserve
  }, [totalSupplyDEIValue, AnyDEIReserve])

  console.log({ totalSupplyDEIValue, circulatingSupply, AnyDEIReserve })

  const reservesCalls = !usdcContract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [collateralPoolAddress],
        },

        {
          methodName: 'balanceOf',
          callInputs: [escrowAddress],
        },
        {
          methodName: 'balanceOf',
          callInputs: [usdcReserves1Address],
        },
      ]

  const [usdcPoolBalance, escrowBalance, usdcBalance4] = useSingleContractMultipleMethods(usdcContract, reservesCalls)

  const { usdcPoolReserves, escrowReserve, usdcReserves1 } = useMemo(() => {
    return {
      usdcPoolReserves: usdcPoolBalance?.result
        ? toBN(formatUnits(usdcPoolBalance?.result[0], 6)).minus(unclaimedCollateralAmount).toNumber()
        : 0,
      escrowReserve: escrowBalance?.result ? toBN(formatUnits(escrowBalance?.result[0], 6)).toNumber() : 0,
      usdcReserves1: usdcBalance4?.result ? toBN(formatUnits(usdcBalance4?.result[0], 6)).toNumber() : 0,
    }
  }, [usdcPoolBalance?.result, unclaimedCollateralAmount, escrowBalance?.result, usdcBalance4?.result])

  // const totalUSDCReserves = useMemo(
  //   () => usdcPoolReserves + escrowReserve + usdcReserves1,
  //   [usdcPoolReserves, escrowReserve, usdcReserves1]
  // )

  const multiSigReserves = useMemo(
    () => totalUSDCReserves - usdcPoolReserves - usdcReserves1,
    [totalUSDCReserves, usdcPoolReserves, usdcReserves1]
  )

  const collateralRatio = useMemo(() => {
    return (totalUSDCReserves / circulatingSupply) * 100
  }, [totalUSDCReserves, circulatingSupply])

  const { mintCollateralRatio, redeemCollateralRatio } = useGetCollateralRatios()
  const seigniorage = Number(mintCollateralRatio) - Number(redeemCollateralRatio)

  useEffect(() => {
    const fetchStats = async () => {
      const response = await makeHttpRequest(DEI_RESERVES_API)
      setTotalUSDCReserves(parseFloat(response ?? 0))
    }
    fetchStats()
  }, [])

  return {
    totalSupply: totalSupplyDEIValue,
    escrowReserve,
    circulatingSupply,
    usdcPoolReserves,
    usdcReserves1,
    totalUSDCReserves,
    multiSigReserves,
    collateralRatio,
    seigniorage,
  }
}
