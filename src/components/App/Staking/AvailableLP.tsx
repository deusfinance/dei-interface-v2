import { PrimaryButton } from 'components/Button'
import { InputField } from 'components/Input'
import { LiquidityType, Stakings } from 'constants/stakingPools'
import { useMasterChefContract } from 'hooks/useContract'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useWeb3React from 'hooks/useWeb3'
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { maxAmountSpend } from 'utils/currency'
import { toBN } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'
import Container from './common/Container'
import { Divider, HStack } from './common/Layout'

const Wrapper = styled(HStack)`
  justify-content: space-between;
  padding: 12px;
  min-height: 50px;
`

const AvailableLPHeader = styled(Wrapper)`
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  cursor: pointer;
  & > p {
    font-size: 0.875rem;
    font-weight: medium;
    &:last-of-type {
      color: ${({ theme }) => theme.text2};
    }
  }
`
const AvailableLPContent = styled(Wrapper)`
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg2};
  padding-block: 0px;
  column-gap: 4px;
`
const AmountInput = styled(InputField)`
  background-color: transparent;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  font-weight: medium;
`
const StakeButton = styled(PrimaryButton)`
  height: 36px !important;
  width: 104px !important;
  font-size: 0.875rem;
  font-weight: bold;
  backdrop-filter: blur(9px);
  border-radius: 8px;
`

const AvailableLP = ({ pool }: { pool: LiquidityType }) => {
  const { account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const addTransaction = useTransactionAdder()

  const lpCurrency = pool.lpToken
  const lpCurrencyBalance = useCurrencyBalance(account ?? undefined, lpCurrency)

  const [amountIn, setAmountIn] = useState<string>('')
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState(false)

  const stakingPool = Stakings.find((p) => p.id === pool.id) || Stakings[0]
  const masterChefContract = useMasterChefContract(stakingPool)

  const onDeposit = useCallback(async () => {
    try {
      if (!masterChefContract || !account || !isSupportedChainId || !amountIn) return
      setAwaitingDepositConfirmation(true)
      const response = await masterChefContract.deposit(stakingPool?.pid, toBN(amountIn).times(1e18).toFixed(), account)
      addTransaction(response, { summary: `Deposit`, vest: { hash: response.hash } })
      setAwaitingDepositConfirmation(false)
      setAmountIn('')
      // setPendingTxHash(response.hash)
    } catch (err) {
      console.log(err)
      toast.error(DefaultHandlerError(err))
      setAwaitingDepositConfirmation(false)
      // setPendingTxHash('')
    }
  }, [masterChefContract, account, isSupportedChainId, amountIn, stakingPool?.pid, addTransaction])

  return (
    <Container>
      <>
        <AvailableLPHeader onClick={() => setAmountIn(maxAmountSpend(lpCurrencyBalance)?.toExact() || '')}>
          <p>LP Available:</p>
          <p>{lpCurrencyBalance?.toSignificant(6)}</p>
        </AvailableLPHeader>
        <Divider backgroundColor="#101116" />
        <AvailableLPContent>
          <AmountInput
            value={amountIn}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setAmountIn(event.target.value)
            }}
            placeholder="Enter amount"
          />
          <StakeButton onClick={() => onDeposit()}>Stake</StakeButton>
        </AvailableLPContent>
      </>
    </Container>
  )
}

export default AvailableLP
