import { useCallback, useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import BigNumber from 'bignumber.js'
import { Interface } from '@ethersproject/abi'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { SolidlyPair, SOLIDLY_PAIRS } from 'apollo/queries'
import { getApolloClient } from 'apollo/client/solidly'
import { lastThursday } from 'utils/vest'

import { ZERO_ADDRESS } from 'constants/addresses'
import { ERC20_ABI } from 'constants/abi/ERC20'

import {
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleMethods,
} from 'state/multicall/hooks'

import {
  useBaseV1BribeContract,
  useBaseV1GaugeContract,
  useBaseV1MinterContract,
  useBaseV1PairContract,
  useBaseV1VoterContract,
} from 'hooks/useContract'

import useWeb3React from './useWeb3'
import { useCustomCoingeckoPrice, useSolidPrice } from 'hooks/useCoingeckoPrice'

dayjs.extend(utc)

export function useFetchSolidlyPairsCallback() {
  const { chainId } = useWeb3React()

  return useCallback(async () => {
    const DEFAULT_RETURN: SolidlyPair[] = []
    try {
      if (!chainId) return DEFAULT_RETURN
      const client = getApolloClient(chainId)
      if (!client) return DEFAULT_RETURN

      const { data } = await client.query({
        query: SOLIDLY_PAIRS,
        fetchPolicy: 'no-cache',
      })

      return data.pairs as SolidlyPair[]
    } catch (error) {
      console.log('Unable to fetch Solidly pairs from The Graph Network')
      console.error(error)
      return []
    }
  }, [chainId])
}

export function useSolidlyPairData(pair: SolidlyPair): {
  // user
  userPoolBalance: string
  userToken0Balance: string
  userToken1Balance: string
  userClaimable0: string
  userClaimable1: string
  // pool
  poolTotalSupply: string
  poolReserve0: string
  poolReserve1: string
  // vote / gauge
  voterTotalWeight: string
  gaugeAddress: string
  gaugeWeight: string
} {
  const { account } = useWeb3React()
  const addressMap = useMemo(() => (account ? [pair.id, pair.token0.id, pair.token1.id] : []), [account, pair])
  const PairContract = useBaseV1PairContract(pair.id)
  const VoterContract = useBaseV1VoterContract()

  /**
   * USER DATA
   */
  const balances = useMultipleContractSingleData(
    addressMap,
    new Interface(ERC20_ABI),
    'balanceOf',
    [account ?? undefined],
    undefined,
    125_000
  )

  const claimableCalls = useMemo(
    () =>
      account
        ? [
            {
              methodName: 'claimable0',
              callInputs: [account],
            },
            {
              methodName: 'claimable0',
              callInputs: [account],
            },
          ]
        : [],
    [account]
  )
  const claimableResults = useSingleContractMultipleMethods(PairContract, claimableCalls)

  /**
   * VOTER / GAUGE DATA
   */
  const voterCalls = useMemo(
    () => [
      {
        methodName: 'totalWeight',
        callInputs: [],
      },
      {
        methodName: 'gauges',
        callInputs: [pair.id],
      },
      {
        methodName: 'weights',
        callInputs: [pair.id],
      },
    ],
    [pair]
  )
  const voterResults = useSingleContractMultipleMethods(VoterContract, voterCalls)

  /**
   * POOL DATA
   */
  const pairResults = useSingleContractMultipleMethods(PairContract, [
    {
      methodName: 'totalSupply',
      callInputs: [],
    },
    {
      methodName: 'reserve0',
      callInputs: [],
    },
    {
      methodName: 'reserve1',
      callInputs: [],
    },
  ])

  return useMemo(
    () => ({
      // user
      userPoolBalance:
        addressMap.length && balances[0]?.result ? formatUnits(balances[0].result[0], pair.decimals) : '0',
      userToken0Balance:
        addressMap.length && balances[1]?.result ? formatUnits(balances[1].result[0], pair.token0.decimals) : '0',
      userToken1Balance:
        addressMap.length && balances[2]?.result ? formatUnits(balances[2].result[0], pair.token1.decimals) : '0',
      userClaimable0:
        claimableResults.length && claimableResults[0]?.result
          ? formatUnits(claimableResults[0].result[0], pair.token0.decimals)
          : '0',
      userClaimable1:
        claimableResults.length && claimableResults[1]?.result
          ? formatUnits(claimableResults[1].result[0], pair.token0.decimals)
          : '0',
      // pool
      poolTotalSupply:
        pairResults.length && pairResults[0]?.result ? formatUnits(pairResults[0].result[0], pair.decimals) : '0',
      poolReserve0:
        pairResults.length && pairResults[1]?.result
          ? formatUnits(pairResults[1].result[0], pair.token0.decimals)
          : '0',
      poolReserve1:
        pairResults.length && pairResults[2]?.result
          ? formatUnits(pairResults[2].result[0], pair.token1.decimals)
          : '0',
      // voter / gauge
      voterTotalWeight:
        voterResults.length && voterResults[0]?.result ? formatUnits(voterResults[0].result[0], 0) : '0',
      gaugeAddress: voterResults.length && voterResults[1]?.result ? voterResults[1].result[0] : ZERO_ADDRESS,
      gaugeWeight: voterResults.length && voterResults[2]?.result ? formatUnits(voterResults[2].result[0], 0) : '0',
    }),
    [addressMap, pair, balances, claimableResults, pairResults, voterResults]
  )
}

export function useSolidlyGaugeData(gaugeAddress: string): {
  gaugeTotalSupply: string
  gaugeBribeAddress: any
  gaugeUserBalance: string
} {
  const { account } = useWeb3React()
  const exists = useMemo(() => gaugeAddress !== ZERO_ADDRESS, [gaugeAddress])

  const GaugeContract = useBaseV1GaugeContract(gaugeAddress)
  const VoterContract = useBaseV1VoterContract()

  const totalSupplyCall = useMemo(() => (exists ? [{ methodName: 'totalSupply', callInputs: [] }] : []), [exists])
  const bribesAddressCall = useMemo(
    () => (exists ? [{ methodName: 'bribes', callInputs: [gaugeAddress] }] : []),
    [exists, gaugeAddress]
  )
  const userBalanceCall = useMemo(
    () => (exists && account ? [{ methodName: 'balanceOf', callInputs: [account] }] : []),
    [exists, account]
  )

  const totalSupplyResult = useSingleContractMultipleMethods(GaugeContract, totalSupplyCall)
  const bribeAddressResult = useSingleContractMultipleMethods(VoterContract, bribesAddressCall)
  const userBalanceResult = useSingleContractMultipleMethods(GaugeContract, userBalanceCall)

  return useMemo(
    () => ({
      gaugeTotalSupply:
        totalSupplyCall.length && totalSupplyResult[0]?.result ? formatUnits(totalSupplyResult[0].result[0], 18) : '0',
      gaugeBribeAddress:
        bribesAddressCall.length && bribeAddressResult[0]?.result ? bribeAddressResult[0].result[0] : ZERO_ADDRESS,
      gaugeUserBalance:
        userBalanceCall.length && userBalanceResult[0]?.result ? formatUnits(userBalanceResult[0].result[0], 18) : '0',
    }),
    [totalSupplyResult, bribeAddressResult, userBalanceResult, totalSupplyCall, bribesAddressCall, userBalanceCall]
  )
}

export function useSolidlyGaugeReserves(
  gaugeTotalSupply: string,
  poolTotalSupply: string,
  poolReserve0: string,
  poolReserve1: string
): {
  gaugeReserve0: BigNumber
  gaugeReserve1: BigNumber
} {
  const reserve0 = useMemo(() => {
    if (!parseFloat(gaugeTotalSupply) || !parseFloat(poolTotalSupply) || !parseFloat(poolReserve0)) {
      return new BigNumber('0')
    }
    return new BigNumber(poolReserve0).times(gaugeTotalSupply).div(poolTotalSupply)
  }, [gaugeTotalSupply, poolTotalSupply, poolReserve0])

  const reserve1 = useMemo(() => {
    if (!parseFloat(gaugeTotalSupply) || !parseFloat(poolTotalSupply) || !parseFloat(poolReserve1)) {
      return new BigNumber('0')
    }
    return new BigNumber(poolReserve1).times(gaugeTotalSupply).div(poolTotalSupply)
  }, [gaugeTotalSupply, poolTotalSupply, poolReserve1])

  return useMemo(
    () => ({
      gaugeReserve0: reserve0,
      gaugeReserve1: reserve1,
    }),
    [reserve0, reserve1]
  )
}

export function usePoolVotesAtSnapshot(bribeAddress: string): {
  poolVotingPowerAtSnapshot: string
  totalVotingPowerAtSnapshot: string
} {
  const BribeContract = useBaseV1BribeContract(bribeAddress)
  const lastThursdayUnix = dayjs(lastThursday()).unix()

  const priorSupplyIndexResult = useSingleCallResult(BribeContract, 'getPriorSupplyIndex', [lastThursdayUnix])
  const priorSupplyIndex: string | undefined = useMemo(
    () => (priorSupplyIndexResult?.result ? priorSupplyIndexResult.result[0].toString() : undefined),
    [priorSupplyIndexResult]
  )

  const supplyCheckpointsResult = useSingleCallResult(
    priorSupplyIndex && typeof priorSupplyIndex === 'string' ? BribeContract : null,
    'supplyCheckpoints',
    [priorSupplyIndex]
  )

  const poolVotingPowerAtSnapshot = useMemo(
    () => (supplyCheckpointsResult?.result ? formatUnits(supplyCheckpointsResult.result[1], 18) : '0'),
    [supplyCheckpointsResult]
  )

  // TODO make this a dynamic value
  const totalVotingPowerAtSnapshot = '54318328'

  return useMemo(
    () => ({
      poolVotingPowerAtSnapshot,
      totalVotingPowerAtSnapshot,
    }),
    [poolVotingPowerAtSnapshot, totalVotingPowerAtSnapshot]
  )
}

export function useSolidEmission(): {
  weeklyEmission: string
} {
  const BaseMinter = useBaseV1MinterContract()
  const weeklyEmissionResult = useSingleCallResult(BaseMinter, 'weekly', [])
  return useMemo(
    () => ({
      weeklyEmission: weeklyEmissionResult?.result ? formatUnits(weeklyEmissionResult.result[0], 18) : '1',
    }),
    [weeklyEmissionResult]
  )
}

export function useSolidlyPoolAPR(pair: SolidlyPair): string {
  const { gaugeAddress, poolReserve0, poolReserve1 } = useSolidlyPairData(pair)
  const { gaugeBribeAddress } = useSolidlyGaugeData(gaugeAddress)
  const { poolVotingPowerAtSnapshot, totalVotingPowerAtSnapshot } = usePoolVotesAtSnapshot(gaugeBribeAddress)
  const { weeklyEmission } = useSolidEmission()
  const solidPrice = useSolidPrice()
  const poolLiquidityValue = usePoolLiquidityValue(pair.token0.symbol, pair.token1.symbol, poolReserve0, poolReserve1)

  return useMemo(() => {
    // total votes for USDC/DEI AT SNAPSHOT = x
    // total veNFT votes AT SNAPSHOT = y
    // total SOLID emission = e
    // price SOLID = z
    // total liquidity USDC/DEI = L
    // APR% = ((x/y)*e*z) / L * 52
    const poolEmissionWeight = new BigNumber(poolVotingPowerAtSnapshot).div(totalVotingPowerAtSnapshot)
    const weeklySolidToPoolInUSD = poolEmissionWeight.times(weeklyEmission).times(solidPrice)
    const weeklyAPR = weeklySolidToPoolInUSD.div(poolLiquidityValue)
    const APR = weeklyAPR.times(52).times(100)
    // console.log('--------------------')
    // console.log('poolVotingPowerAtSnapshot: ', poolVotingPowerAtSnapshot)
    // console.log('totalVotingPowerAtSnapshot: ', totalVotingPowerAtSnapshot)
    // console.log('poolEmissionWeight: (poolVoting/totalVoting)', poolEmissionWeight.toFixed())
    // console.log('solidPrice: ', solidPrice)
    // console.log('weeklyEmission: ', weeklyEmission)
    // console.log('weeklySolidToPoolInUSD: (price x emission)', weeklySolidToPoolInUSD.toFixed())
    // console.log('weeklyAPR: ', weeklyAPR.toFixed())
    // console.log('poolLiquidityValue: ', poolLiquidityValue)
    // console.log('APR: ', APR.toFixed())
    // console.log('--------------------')
    return APR.isNaN() || !APR.isFinite() ? '0' : APR.toFixed()
  }, [poolVotingPowerAtSnapshot, totalVotingPowerAtSnapshot, weeklyEmission, solidPrice, poolLiquidityValue])
}

function usePoolLiquidityValue(symbol0: string, symbol1: string, reserve0: string, reserve1: string) {
  const symbol0Price = useCustomCoingeckoPrice(symbol0)
  const symbol1Price = useCustomCoingeckoPrice(symbol1)
  return useMemo(() => {
    if (!parseFloat(symbol0Price) || !parseFloat(symbol1Price) || !parseFloat(reserve0) || !parseFloat(reserve1)) {
      return '0'
    }
    const value0 = new BigNumber(symbol0Price).times(reserve0)
    const value1 = new BigNumber(symbol1Price).times(reserve1)
    return value0.plus(value1).toFixed()
  }, [symbol0Price, symbol1Price, reserve0, reserve1])
}
