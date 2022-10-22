import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { AMO, escrow, ProtocolHoldings1, ProtocolHoldings2, USDCReserves1, USDCReserves2 } from 'constants/addresses'
import { DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { toBN } from 'utils/numbers'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useERC20Contract } from 'hooks/useContract'
import { CollateralPool } from '../constants/addresses'
import { useUnclaimedCollateralAmount } from '../state/dei/hooks'

export function useDeiStats(): {
  totalSupply: number
  deiProtocolHoldings1: number
  deiProtocolHoldings2: number
  totalProtocolHoldings: number
  AMOReserve: number
  escrowReserve: number
  circulatingSupply: number
  usdcPoolReserves: number
  usdcReserves1: number
  usdcReserves2: number
  totalUSDCReserves: number
  collateralRatio: number
} {
  const deiContract = useERC20Contract(DEI_TOKEN.address)
  const usdcContract = useERC20Contract(USDC_TOKEN.address)
  const protocolHoldings1Address = ProtocolHoldings1[SupportedChainId.FANTOM]
  const protocolHoldings2Address = ProtocolHoldings2[SupportedChainId.FANTOM]
  const collateralPoolAddress = CollateralPool[SupportedChainId.FANTOM]
  const usdcReserves1Address = USDCReserves1[SupportedChainId.FANTOM]
  const usdcReserves2Address = USDCReserves2[SupportedChainId.FANTOM]
  const escrowAddress = escrow[SupportedChainId.FANTOM]
  const AMOAddress = AMO[SupportedChainId.FANTOM]
  const unclaimedCollateralAmount = useUnclaimedCollateralAmount()

  const calls = !deiContract
    ? []
    : [
        {
          methodName: 'totalSupply',
          callInputs: [],
        },
        {
          methodName: 'balanceOf',
          callInputs: [protocolHoldings1Address],
        },
        {
          methodName: 'balanceOf',
          callInputs: [protocolHoldings2Address],
        },
      ]

  const [totalSupplyDEI, ph1DeiHoldings, ph2DeiHoldings] = useSingleContractMultipleMethods(deiContract, calls)

  const { totalSupplyDEIValue, totalProtocolHoldings, deiProtocolHoldings1, deiProtocolHoldings2 } = useMemo(() => {
    return {
      totalSupplyDEIValue: totalSupplyDEI?.result ? toBN(formatUnits(totalSupplyDEI.result[0], 18)).toNumber() : 0,
      totalProtocolHoldings:
        (ph1DeiHoldings?.result ? toBN(formatUnits(ph1DeiHoldings.result[0], 18)).toNumber() : 0) +
        (ph2DeiHoldings?.result ? toBN(formatUnits(ph2DeiHoldings.result[0], 18)).toNumber() : 0),
      deiProtocolHoldings1: ph1DeiHoldings?.result ? toBN(formatUnits(ph1DeiHoldings.result[0], 18)).toNumber() : 0,
      deiProtocolHoldings2: ph2DeiHoldings?.result ? toBN(formatUnits(ph2DeiHoldings.result[0], 18)).toNumber() : 0,
    }
  }, [totalSupplyDEI, ph1DeiHoldings, ph2DeiHoldings])

  const circulatingSupply = useMemo(() => {
    return totalSupplyDEIValue - totalProtocolHoldings
  }, [totalSupplyDEIValue, totalProtocolHoldings])

  const reservesCalls = !usdcContract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [collateralPoolAddress],
        },
        {
          methodName: 'balanceOf',
          callInputs: [usdcReserves1Address],
        },
        {
          methodName: 'balanceOf',
          callInputs: [usdcReserves2Address],
        },
        {
          methodName: 'balanceOf',
          callInputs: [AMOAddress],
        },
        {
          methodName: 'balanceOf',
          callInputs: [escrowAddress],
        },
      ]

  const [usdcPoolBalance, usdcBalance1, usdcBalance2, AMOBalance, escrowBalance] = useSingleContractMultipleMethods(
    usdcContract,
    reservesCalls
  )
  const { usdcPoolReserves, usdcReserves1, usdcReserves2, AMOReserve, escrowReserve } = useMemo(() => {
    return {
      usdcPoolReserves: usdcPoolBalance?.result
        ? toBN(formatUnits(usdcPoolBalance?.result[0], 6)).minus(unclaimedCollateralAmount).toNumber()
        : 0,
      usdcReserves1: usdcBalance1?.result ? toBN(formatUnits(usdcBalance1?.result[0], 6)).toNumber() : 0,
      usdcReserves2: usdcBalance2?.result ? toBN(formatUnits(usdcBalance2.result[0], 6)).toNumber() : 0,
      AMOReserve: AMOBalance?.result ? toBN(formatUnits(AMOBalance.result[0], 6)).toNumber() : 0,
      escrowReserve: escrowBalance?.result ? toBN(formatUnits(escrowBalance.result[0], 6)).toNumber() : 0,
    }
  }, [
    usdcPoolBalance?.result,
    unclaimedCollateralAmount,
    usdcBalance1?.result,
    usdcBalance2?.result,
    AMOBalance?.result,
    escrowBalance?.result,
  ])

  const totalUSDCReserves = useMemo(
    () => usdcReserves1 + usdcReserves2 + usdcPoolReserves + escrowReserve,
    [usdcReserves1, usdcReserves2, usdcPoolReserves, escrowReserve]
  )

  const collateralRatio = useMemo(() => {
    return ((usdcPoolReserves + escrowReserve) / circulatingSupply) * 100
  }, [usdcPoolReserves, escrowReserve, circulatingSupply])

  return {
    totalSupply: totalSupplyDEIValue,
    deiProtocolHoldings1,
    deiProtocolHoldings2,
    totalProtocolHoldings,
    AMOReserve,
    escrowReserve,
    circulatingSupply,
    usdcPoolReserves,
    usdcReserves1,
    usdcReserves2,
    totalUSDCReserves,
    collateralRatio,
  }
}
