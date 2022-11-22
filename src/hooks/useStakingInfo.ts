import { useMemo } from 'react'
import { useERC20Contract, useMasterChefContract } from 'hooks/useContract'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { toBN } from 'utils/numbers'
import useWeb3React from './useWeb3'
import { formatUnits } from '@ethersproject/units'
import { useDeusPrice } from './useCoingeckoPrice'
import { MasterChefV2 } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useVDeusMultiRewarderERC20Contract } from './useContract'
import { StablePoolType } from 'constants/sPools'
import { usePoolBalances } from './useStablePoolInfo'
import { StakingType } from 'constants/stakings'

//TODO: should remove all and put it in /constants
const pids = [0, 1]
const stakingTokens: { [pid: number]: string } = {
  [pids[0]]: '0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8',
  [pids[1]]: '0xDce9EC1eB454829B6fe0f54F504FEF3c3C0642Fc',
}

export function useGlobalMasterChefData(stakingPool: StakingType): {
  tokenPerBlock: number
  totalAllocPoint: number
  poolLength: number
} {
  const contract = useMasterChefContract(stakingPool)

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
export function useUserInfo(stakingPool: StakingType): {
  depositAmount: number
  rewardsAmount: number
  totalDepositedAmount: number
} {
  const contract = useMasterChefContract(stakingPool)
  const { account } = useWeb3React()
  const pid = stakingPool.pid
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
        {
          methodName: 'totalDepositedAmount',
          callInputs: [pid.toString()],
        },
      ]

  const [userInfo, pendingTokens, totalDepositedAmount] = useSingleContractMultipleMethods(contract, calls)

  const { depositedValue, reward, totalDepositedAmountValue } = useMemo(() => {
    return {
      depositedValue: userInfo?.result ? toBN(formatUnits(userInfo.result[0].toString(), 18)).toNumber() : 0,
      reward: pendingTokens?.result ? toBN(formatUnits(pendingTokens.result[0], 18)).toNumber() : 0,
      totalDepositedAmountValue: totalDepositedAmount?.result
        ? toBN(formatUnits(totalDepositedAmount.result[0], 18)).toNumber()
        : 0,
    }
  }, [userInfo, pendingTokens, totalDepositedAmount])

  return {
    depositAmount: depositedValue,
    rewardsAmount: reward,
    totalDepositedAmount: totalDepositedAmountValue,
  }
}

//get deus reward apy for deus-vdeus lp pool
export function useGetDeusApy(pool: StablePoolType, stakingPool: StakingType): number {
  const contract = useVDeusMultiRewarderERC20Contract()
  // const deusPrice = useDeusPrice()

  const calls = [
    {
      methodName: 'retrieveTokenPerBlock',
      callInputs: [stakingPool.pid, 0],
    },
  ]
  const [retrieveTokenPerBlock] = useSingleContractMultipleMethods(contract, calls)
  const balances = usePoolBalances(pool)
  const vdeusBalance = balances[0]
  const deusBalance = balances[1]

  const { depositAmount, totalDepositedAmount } = useUserInfo(stakingPool)

  const retrieveTokenPerBlockValue = useMemo(() => {
    return retrieveTokenPerBlock?.result ? toBN(formatUnits(retrieveTokenPerBlock.result[0], 18)).toNumber() : 0
  }, [retrieveTokenPerBlock])

  // const totalDeposited = toBN(deusBalance).times(2).times(deusPrice).toNumber()

  const ratio = depositAmount / totalDepositedAmount
  const totalBalance = vdeusBalance + deusBalance
  const myShare = ratio * totalBalance
  const retrieveTokenPerYearValue = retrieveTokenPerBlockValue * 365 * 24 * 60 * 60
  const myAprShare = ratio * retrieveTokenPerYearValue

  // console.log({ ratio, totalBalance, myShare, retrieveTokenPerYearValue, myAprShare })

  if (!myShare || myShare === 0) return (retrieveTokenPerYearValue / totalBalance) * 100
  return (myAprShare / myShare) * 100

  // if (totalDeposited === 0) return 0
  // return (retrieveTokenPerBlockValue * parseFloat(deusPrice) * 365 * 24 * 60 * 60 * 100) / totalDeposited
}
//get deus reward for deus-vdeus lp pool user
export function useGetDeusReward(): number {
  const contract = useVDeusMultiRewarderERC20Contract()
  const { account } = useWeb3React()

  const calls = useMemo(() => {
    return !account
      ? []
      : [
          {
            methodName: 'pendingTokens',
            callInputs: [2, account],
          },
        ]
  }, [account])

  const [pendingTokens] = useSingleContractMultipleMethods(contract, calls)

  // console.log({ pendingTokens })

  return useMemo(() => {
    return pendingTokens?.result ? toBN(formatUnits(pendingTokens.result[1][0], 18)).toNumber() : 0
  }, [pendingTokens])
}

//TODO: totalDeposited should consider decimals of token
export function usePoolInfo(stakingPool: StakingType): {
  accTokensPerShare: number
  lastRewardBlock: number
  allocPoint: number
  totalDeposited: number
} {
  const contract = useMasterChefContract(stakingPool)
  const tokenAddress = stakingTokens[stakingPool.pid]
  const ERC20Contract = useERC20Contract(tokenAddress)
  const calls = [
    {
      methodName: 'poolInfo',
      callInputs: [stakingPool.pid.toString()],
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

export function useGetApy(stakingPool: StakingType): number {
  const { tokenPerBlock, totalAllocPoint } = useGlobalMasterChefData(stakingPool)
  const { totalDeposited, allocPoint } = usePoolInfo(stakingPool)
  // console.log(tokenPerBlock, totalDeposited)
  // const deiPrice = useDeiPrice()
  const deusPrice = useDeusPrice()
  // console.log({ allocPoint, totalAllocPoint, pid })
  if (totalDeposited === 0) return 0
  return (
    (tokenPerBlock * (allocPoint / totalAllocPoint) * parseFloat(deusPrice) * 365 * 24 * 60 * 60 * 100) / totalDeposited
  )
}
