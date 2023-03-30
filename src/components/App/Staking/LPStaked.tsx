import { InputField } from 'components/Input'
import { Stakings } from 'constants/stakingPools'
import { useMasterChefContract } from 'hooks/useContract'
import { useUserInfo } from 'hooks/useStakingInfo'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useWeb3React from 'hooks/useWeb3'
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useTransactionAdder } from 'state/transactions/hooks'
import styled from 'styled-components'
import { toBN } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'
import Container from './common/Container'
import { Divider, HStack, VStack } from './common/Layout'

const Wrapper = styled(HStack)`
  justify-content: space-between;
  padding: 12px;
  min-height: 50px;
`
const StakedLPHeader = styled(Wrapper)`
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  cursor: pointer;
  & > p:first-of-type {
    font-weight: medium;
    background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  & > p {
    color: ${({ theme }) => theme.text1};
  }
`
const StakedLPReward = styled(Wrapper)<{ disabled?: boolean }>`
  background-color: ${({ theme }) => theme.bg1};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'default')};
  p {
    &.text {
      margin-right: 4px;
      color: #8f939c;
    }
    &:not(p.text) {
      background: -webkit-linear-gradient(left, #0badf4 0%, #30efe4 93.4%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    font-size: 1rem;
    font-weight: medium;
  }
`
const BaseButton = styled.button`
  height: 36px;
  width: 104px;
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  & > span {
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    & > p {
      font-size: 0.875rem;
      font-weight: bold;
    }
  }
`
const StakedLPRewardButton = styled(BaseButton)`
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  border-radius: 8px;
  & > span {
    background-color: ${({ theme }) => theme.bg0};
    & > p {
      background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  &:hover {
    & > span {
      background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
      & > p {
        background: ${({ theme }) => theme.bg0};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }
`
const UnStakedContainer = styled(Wrapper)`
  background-color: ${({ theme }) => theme.bg1};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  padding-block: 8px;
`

const UnStakedInput = styled(InputField)`
  background-color: transparent;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  font-weight: medium;
`
const UnStakedButton = styled(BaseButton)`
  background: #8f939c;
  border-radius: 8px;
  & > span {
    background-color: ${({ theme }) => theme.bg0};
    & > p {
      color: ${({ theme }) => theme.text1};
    }
  }
  &:hover {
    & > span {
      background-color: ${({ theme }) => theme.bg2};
    }
  }
`
const StakedLP = ({ pid }: { pid: number }) => {
  const [amountIn, setAmountIn] = useState<string>('')

  const { account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const addTransaction = useTransactionAdder()

  const [awaitingWithdrawConfirmation, setAwaitingWithdrawConfirmation] = useState(false)
  const [awaitingClaimConfirmation, setAwaitClaimConfirmation] = useState(false)

  const stakingPool = Stakings.find((pool) => pool.id === pid) || Stakings[0]
  const masterChefContract = useMasterChefContract(stakingPool)

  // const lpCurrency = pool.lpToken
  // const lpCurrencyBalance = useCurrencyBalance(account ?? undefined, lpCurrency)

  const { rewardAmounts, depositAmount, totalDepositedAmount, rewardTokens } = useUserInfo(stakingPool)

  const onWithdraw = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId || !amountIn) return
      setAwaitingWithdrawConfirmation(true)
      const response = await masterChefContract.withdraw(
        stakingPool?.pid,
        toBN(amountIn).times(1e18).toFixed(),
        account
      )
      addTransaction(response, { summary: `Withdraw ${amountIn}`, vest: { hash: response.hash } })
      setAwaitingWithdrawConfirmation(false)
      setAmountIn('')
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingWithdrawConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, account, isSupportedChainId, amountIn, stakingPool?.pid, addTransaction])

  const onClaimReward = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId) return
      setAwaitClaimConfirmation(true)
      const response = await masterChefContract.harvest(stakingPool?.pid, account)
      addTransaction(response, { summary: `Claim Rewards`, vest: { hash: response.hash } })
      setAwaitClaimConfirmation(false)
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitClaimConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, account, isSupportedChainId, stakingPool?.pid, addTransaction])

  return (
    <Container>
      <>
        <StakedLPHeader onClick={() => setAmountIn(depositAmount)}>
          <p>{stakingPool.token?.symbol} Staked:</p>
          <p>{Number(depositAmount).toFixed(6)}</p>
        </StakedLPHeader>
        <Divider backgroundColor="#101116" />
        <StakedLPReward disabled={!rewardAmounts[0]}>
          {rewardTokens.length > 1 ? (
            <HStack>
              <p className="text">Rewards: </p>
              <VStack>
                {rewardTokens?.map((token, index) => (
                  <p key={index}>
                    {Number(rewardAmounts[index]).toFixed(2)} {rewardTokens[index].symbol}
                  </p>
                ))}
              </VStack>
            </HStack>
          ) : (
            <HStack>
              <p className="text">Reward: </p>
              <p>
                {Number(rewardAmounts[0]).toFixed(2)} {rewardTokens[0].symbol}
              </p>
            </HStack>
          )}
          <StakedLPRewardButton onClick={() => onClaimReward()}>
            <span>
              <p>Claim</p>
            </span>
          </StakedLPRewardButton>
        </StakedLPReward>
        <Divider backgroundColor="#101116" />
        <UnStakedContainer>
          <UnStakedInput
            value={amountIn}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAmountIn(event.target.value)}
            placeholder="Enter amount"
          />
          <UnStakedButton onClick={() => onWithdraw()}>
            <span>
              <p>Unstake</p>
            </span>
          </UnStakedButton>
        </UnStakedContainer>
      </>
    </Container>
  )
}

export default StakedLP
