import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'

import { useDeusMetrics } from 'state/dashboard/hooks'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useSupportedChainId } from './useSupportedChainId'
import { useVeDeusContract } from './useContract'
import { useDeusPrice } from './useCoingeckoPrice'

dayjs.extend(utc)

export function useVestedInformation(nftId: number): {
  deusAmount: string
  veDEUSAmount: string
  lockEnd: Date
} {
  const isSupportedChainId = useSupportedChainId()
  const veDEUSContract = useVeDeusContract()

  const calls = useMemo(
    () =>
      !isSupportedChainId
        ? []
        : [
            {
              methodName: 'balanceOfNFT',
              callInputs: [nftId],
            },
            {
              methodName: 'locked',
              callInputs: [nftId],
            },
          ],
    [isSupportedChainId, nftId]
  )

  const [balanceResult, lockedResult] = useSingleContractMultipleMethods(veDEUSContract, calls)
  return useMemo(
    () => ({
      deusAmount: calls.length && lockedResult?.result ? formatUnits(lockedResult.result[0], 18) : '0',
      veDEUSAmount: calls.length && balanceResult?.result ? formatUnits(balanceResult.result[0], 18) : '0',
      lockEnd:
        calls.length && lockedResult?.result
          ? dayjs.unix(Number(formatUnits(lockedResult.result[1], 0))).toDate()
          : dayjs.utc().toDate(),
    }),
    [calls, balanceResult, lockedResult]
  )
}
const CIRCULATING_SUPPLY = 102000
const DEUS_EMISSION_PER_WEEK = 2500
const WEEKLY_ACCRUED_DEI_FEES = '1'

export function useVestedAPY(
  nftId?: number,
  userInputLockEnd?: Date
): {
  weeklyDEUSEmission: number
  totalVeDEUS: string
  lockedVeDEUS: string
  antiDilutiveAPY: string
  deiAPY: string
  bribesAPY: string
  globalAPY: string
  userAPY: string
} {
  const veDEUSContract = useVeDeusContract()
  const effectiveNftId = useMemo(() => nftId ?? 0, [nftId])
  const { lockEnd } = useVestedInformation(effectiveNftId)
  const effectiveLockEnd = useMemo(() => userInputLockEnd ?? lockEnd, [userInputLockEnd, lockEnd])
  const deusPrice = useDeusPrice()

  const veDEUSCalls = [
    {
      methodName: 'totalSupply',
      callInputs: [],
    },
    {
      methodName: 'supply',
      callInputs: [],
    },
  ]

  const [totalSupplyResult, supplyResult] = useSingleContractMultipleMethods(veDEUSContract, veDEUSCalls)

  const {
    totalVeDEUS,
    lockedVeDEUS,
  }: {
    totalVeDEUS: string
    lockedVeDEUS: string
  } = useMemo(
    () => ({
      totalVeDEUS: totalSupplyResult?.result ? formatUnits(totalSupplyResult.result[0], 18) : '0',
      lockedVeDEUS: supplyResult?.result ? formatUnits(supplyResult.result[0], 18) : '0',
    }),
    [totalSupplyResult, supplyResult]
  )

  const { deusCirculatingSupply } = useDeusMetrics()

  const annualUSDEmissionToVeDEUS: BigNumber = useMemo(() => {
    const lockedAntiDilutiveShare = new BigNumber(lockedVeDEUS).div(deusCirculatingSupply || CIRCULATING_SUPPLY)
    const annualDEUSEmissionToVeDEUS = lockedAntiDilutiveShare.times(DEUS_EMISSION_PER_WEEK).div(7).times(365)
    return annualDEUSEmissionToVeDEUS.times(deusPrice)
  }, [lockedVeDEUS, deusPrice, deusCirculatingSupply])

  const annualDEIEmissionToVeDEUS: BigNumber = useMemo(
    () => new BigNumber(WEEKLY_ACCRUED_DEI_FEES).div(7).times(365),
    []
  )

  const totalValueToVeDEUS: BigNumber = useMemo(
    () => annualUSDEmissionToVeDEUS.plus(annualDEIEmissionToVeDEUS),
    [annualUSDEmissionToVeDEUS, annualDEIEmissionToVeDEUS]
  )

  const globalAPY: BigNumber = useMemo(() => {
    if (!totalVeDEUS || totalVeDEUS === '0' || !deusPrice || deusPrice === '0') return new BigNumber('0')
    return totalValueToVeDEUS.div(totalVeDEUS).div(deusPrice).times(100)
  }, [totalValueToVeDEUS, totalVeDEUS, deusPrice])

  const userAPY: BigNumber = useMemo(() => {
    const lockDurationInDays = Math.abs(dayjs.utc().diff(effectiveLockEnd, 'day'))
    return new BigNumber(lockDurationInDays).div(365 * 4).times(globalAPY)
  }, [effectiveLockEnd, globalAPY])

  return useMemo(
    () => ({
      // for stats
      weeklyDEUSEmission: DEUS_EMISSION_PER_WEEK,
      totalVeDEUS,
      lockedVeDEUS,
      // individual APY components:
      antiDilutiveAPY: annualUSDEmissionToVeDEUS.div(totalVeDEUS).div(deusPrice).times(100).toFixed(),
      deiAPY: annualDEIEmissionToVeDEUS.div(totalVeDEUS).div(deusPrice).times(100).toFixed(),
      bribesAPY: '0',
      // above components result in these:
      globalAPY: globalAPY.toFixed(),
      userAPY: userAPY.toFixed(),
    }),
    [globalAPY, userAPY, deusPrice, annualUSDEmissionToVeDEUS, annualDEIEmissionToVeDEUS, lockedVeDEUS, totalVeDEUS]
  )
}
