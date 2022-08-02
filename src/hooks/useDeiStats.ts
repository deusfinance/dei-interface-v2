import { formatUnits } from '@ethersproject/units'
import { ProtocolHoldings1, ProtocolHoldings2, SwapFlashLoan, USDCReserves1, USDCReserves2 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { BDEI_TOKEN, DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import { useBonderData } from './useBondsPage'
import { useERC20Contract } from './useContract'

export function useDeiStats(): {
  totalSupply: number
  deiProtocolHoldings1: number
  deiProtocolHoldings2: number
  totalProtocolHoldings: number
  circulatingSupply: number
  usdcReserves1: number
  usdcReserves2: number
  totalUSDCReserves: number
  sPoolDEILiquidity: number
  sPoolbDEILiquidity: number
  sPoolLiquidity: number
} {
  const { deiBonded } = useBonderData()
  const deiContract = useERC20Contract(DEI_TOKEN.address)
  const bDeiContract = useERC20Contract(BDEI_TOKEN.address)
  const usdcContract = useERC20Contract(USDC_TOKEN.address)
  const protocolHoldings1Address = ProtocolHoldings1[SupportedChainId.FANTOM]
  const protocolHoldings2Address = ProtocolHoldings2[SupportedChainId.FANTOM]
  const usdcReserves1Address = USDCReserves1[SupportedChainId.FANTOM]
  const usdcReserves2Address = USDCReserves2[SupportedChainId.FANTOM]
  const sPoolAddress = SwapFlashLoan[SupportedChainId.FANTOM]

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
          callInputs: [usdcReserves1Address],
        },
        {
          methodName: 'balanceOf',
          callInputs: [usdcReserves2Address],
        },
      ]

  const [usdcBalance1, usdcBalance2] = useSingleContractMultipleMethods(usdcContract, reservesCalls)

  const { totalUSDCReserves, usdcReserves1, usdcReserves2 } = useMemo(() => {
    return {
      totalUSDCReserves:
        (usdcBalance1?.result ? toBN(formatUnits(usdcBalance1.result[0], 6)).toNumber() : 0) +
        (usdcBalance2?.result ? toBN(formatUnits(usdcBalance2.result[0], 6)).toNumber() : 0),
      usdcReserves1: usdcBalance1?.result ? toBN(formatUnits(usdcBalance1.result[0], 6)).toNumber() : 0,
      usdcReserves2: usdcBalance2?.result ? toBN(formatUnits(usdcBalance2.result[0], 6)).toNumber() : 0,
    }
  }, [usdcBalance1, usdcBalance2])

  const sPoolDEICalls = !deiContract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [sPoolAddress],
        },
      ]

  const sPoolbDEICalls = !bDeiContract
    ? []
    : [
        {
          methodName: 'balanceOf',
          callInputs: [sPoolAddress],
        },
      ]

  const [deiLiquidity] = useSingleContractMultipleMethods(deiContract, sPoolDEICalls)
  const [bDeiLiquidity] = useSingleContractMultipleMethods(bDeiContract, sPoolbDEICalls)

  const { sPoolDEILiquidity, sPoolbDEILiquidity, sPoolLiquidity } = useMemo(() => {
    return {
      sPoolLiquidity:
        (bDeiLiquidity?.result ? toBN(formatUnits(bDeiLiquidity.result[0], 18)).toNumber() : 0) +
        (deiLiquidity?.result ? toBN(formatUnits(deiLiquidity.result[0], 18)).toNumber() : 0),
      sPoolbDEILiquidity: bDeiLiquidity?.result ? toBN(formatUnits(bDeiLiquidity.result[0], 18)).toNumber() : 0,
      sPoolDEILiquidity: deiLiquidity?.result ? toBN(formatUnits(deiLiquidity.result[0], 18)).toNumber() : 0,
    }
  }, [bDeiLiquidity, deiLiquidity])

  return {
    totalSupply: totalSupplyDEIValue,
    deiProtocolHoldings1,
    deiProtocolHoldings2,
    totalProtocolHoldings,
    circulatingSupply,
    usdcReserves1,
    usdcReserves2,
    totalUSDCReserves,
    sPoolDEILiquidity,
    sPoolbDEILiquidity,
    sPoolLiquidity,
  }
}
