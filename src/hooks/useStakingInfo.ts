import { useMemo } from 'react'
import { useERC20Contract, useMasterChefV2Contract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import useWeb3React from './useWeb3'
import { formatUnits } from '@ethersproject/units'
import { useDeiPrice, useDeusPrice } from './useCoingeckoPrice'
import { MasterChefV2 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'

//TODO: should remove all and put it in /constants
const pids = [0, 1]
const stakingTokens: { [pid: number]: string } = {
  [pids[0]]: '0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8',
  [pids[1]]: '0xDce9EC1eB454829B6fe0f54F504FEF3c3C0642Fc',
}

export function useGlobalMasterChefData(): {
  tokenPerBlock: number
  totalAllocPoint: number
  poolLength: number
} {
  const contract = useMasterChefV2Contract()

  const calls = [
    {
      methodName: 'tokenPerBlock',
      callInputs: [],
    },
    {
      methodName: 'totalAllocPoint',
      callInputs: [],
    },
    {
      methodName: 'poolLength',
      callInputs: [],
    },
  ]

  const [tokenPerBlock, totalAllocPoint, poolLength] = useSingleContractMultipleMethods(contract, calls)

  const { tokenPerBlockValue, totalAllocPointValue, poolLengthValue } = useMemo(() => {
    return {
      tokenPerBlockValue: tokenPerBlock?.result ? toBN(formatUnits(tokenPerBlock.result[0], 18)).toNumber() : 0,
      totalAllocPointValue: totalAllocPoint?.result ? toBN(totalAllocPoint.result[0].toString()).toNumber() : 0,
      poolLengthValue: poolLength?.result ? toBN(poolLength.result[0].toString()).toNumber() : 0,
    }
  }, [tokenPerBlock, totalAllocPoint, poolLength])

  return {
    tokenPerBlock: tokenPerBlockValue,
    totalAllocPoint: totalAllocPointValue,
    poolLength: poolLengthValue,
  }
}

//TODO: depositAmount should consider decimals of token
export function useUserInfo(pid: number): {
  depositAmount: number
  rewardsAmount: number
} {
  const contract = useMasterChefV2Contract()
  const { account } = useWeb3React()
  const calls = !account
    ? []
    : [
        {
          methodName: 'userInfo',
          callInputs: [pid.toString(), account],
        },
        {
          methodName: 'pendingTokens',
          callInputs: [pid.toString(), account],
        },
      ]

  const [userInfo, pendingTokens] = useSingleContractMultipleMethods(contract, calls)

  const { depositedValue, reward } = useMemo(() => {
    return {
      depositedValue: userInfo?.result ? toBN(formatUnits(userInfo.result[0], 18)).toNumber() : 0,
      reward: pendingTokens?.result ? toBN(formatUnits(pendingTokens.result[0], 18)).toNumber() : 0,
    }
  }, [userInfo, pendingTokens])

  return {
    depositAmount: depositedValue,
    rewardsAmount: reward,
  }
}

//TODO: totalDeposited should consider decimals of token
export function usePoolInfo(pid: number): {
  accTokensPerShare: number
  lastRewardBlock: number
  allocPoint: number
  totalDeposited: number
} {
  const contract = useMasterChefV2Contract()
  const tokenAddress = stakingTokens[pid]
  const ERC20Contract = useERC20Contract(tokenAddress)
  const calls = [
    {
      methodName: 'poolInfo',
      callInputs: [pid.toString()],
    },
  ]

  const balanceCall = [
    {
      methodName: 'balanceOf',
      callInputs: [MasterChefV2[SupportedChainId.FANTOM]],
    },
  ]

  const [poolInfo] = useSingleContractMultipleMethods(contract, calls)
  const [tokenBalance] = useSingleContractMultipleMethods(ERC20Contract, balanceCall)
  const { accTokensPerShare, lastRewardBlock, allocPoint, totalDeposited } = useMemo(() => {
    return {
      accTokensPerShare: poolInfo?.result ? toBN(poolInfo.result[0].toString()).toNumber() : 0,
      lastRewardBlock: poolInfo?.result ? toBN(poolInfo.result[1].toString()).toNumber() : 0,
      allocPoint: poolInfo?.result ? toBN(poolInfo.result[2].toString()).toNumber() : 0,
      totalDeposited: tokenBalance?.result ? toBN(formatUnits(tokenBalance.result[0], 18)).toNumber() : 0,
    }
  }, [poolInfo, tokenBalance])

  return {
    accTokensPerShare,
    lastRewardBlock,
    allocPoint,
    totalDeposited,
  }
}

export function useGetApy(pid: number): number {
  const { tokenPerBlock, totalAllocPoint } = useGlobalMasterChefData()
  const { totalDeposited, allocPoint } = usePoolInfo(pid)
  // console.log(tokenPerBlock, totalDeposited)
  const deiPrice = useDeiPrice()
  const deusPrice = useDeusPrice()
  // console.log({ allocPoint, totalAllocPoint, pid })
  if (totalDeposited === 0) return 0
  return (
    (tokenPerBlock * (allocPoint / totalAllocPoint) * parseFloat(deusPrice) * 365 * 24 * 60 * 60 * 100) /
    (totalDeposited * parseFloat(deiPrice))
  )
}
