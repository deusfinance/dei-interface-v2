import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useDebounce from 'hooks/useDebounce'
import { useAddLiquidity, useRemoveLiquidity } from 'hooks/useStablePoolInfo'
import useManageLiquidity from 'hooks/useLiquidityCallback'

import { tryParseAmount } from 'utils/parse'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import ActionSetter, { ActionTypes } from './ActionSetter'
import InputBox from 'components/InputBox'
import { LiquidityType } from 'constants/stakingPools'
import { Divider, HStack } from './common/Layout'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 0 10px;
  margin-top: 12px;
  background: ${({ theme }) => theme.bg1};
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 12px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left: 20px;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 340px;
  `}
`

const ToggleState = styled.div`
  background: ${({ theme }) => theme.bg1};
  margin: -21px -16px 21px -16px;
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
`

const DepositButton = styled(PrimaryButton)`
  border-radius: 15px;
`
const BetweenStack = styled(HStack)`
  justify-content: space-between;
`
const WithdrawText = styled.p`
  color: ${({ theme }) => theme.text1};
  & :first-of-type {
    font-size: 1rem;
    font-weight: medium;
  }
  & :last-of-type {
    font-size: 0.75rem;
  }
`
const WithdrawPercentage = styled(HStack)`
  column-gap: 7px;
`
const PercentButton = styled.button<{ isActive: boolean }>`
  text-align: center;
  min-width: 63px;
  min-height: 36px;
  background: ${({ isActive, theme }) => (isActive ? '-webkit-linear-gradient(90deg, #e0974c, #c93f6f);' : theme.bg2)};
  padding: 1px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  & > span {
    border-radius: 8px;
    background-color: ${({ isActive, theme }) => (isActive ? theme.bg0 : theme.bg5)};
    min-width: 62px;
    min-height: 35px;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: center;
  }
`
const SelectedPercentBox = styled(HStack)`
  height: 36px;
  width: 82px;
  background: ${({ theme }) => theme.bg2};
  align-items: center;
  border-radius: 8px;
  justify-content: center;
  & > span {
    padding-inline: 12px;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.bg5};
    width: 81px;
    height: 35px;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: space-between;
  }
`
const Input = styled.input`
  background-color: transparent;
  width: 100%;
  height: 100%;
  display: inline-block;
  color: ${({ theme }) => theme.text1};
  border: none;
  outline: none;
`
const WithdrawHeading = styled.p`
  font-size: 1rem;
  font-weight: medium;
  color: ${({ theme }) => theme.text1};
`
const RadioContainer = styled(HStack)`
  column-gap: 25px;
  margin-top: 15px;
`
const RadioButton = styled.input`
  margin-right: 10px !important;
  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-appearance: none;
  -o-appearance: none;
  appearance: none;
  &:after {
    width: 14px;
    height: 14px;
    border-radius: 14px;
    position: relative;
    content: '';
    display: inline-block;
    visibility: visible;
    outline: 1px solid red;
    outline-color: ${({ theme }) => theme.text2};
    outline-offset: 3px;
  }
  &:checked:after {
    background-image: linear-gradient(90deg, #e0974c 0%, #c93f6f 100%);
    content: '';
    display: inline-block;
  }
`
const PercentBox = () => {
  const [selectedPercent, setPercent] = useState<string>('25')
  const percentValue: string[] = ['25', '50', '75', '100']
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    const isSelectedExist = percentValue.find((value) => value === inputValue)
    if (isSelectedExist) {
      setPercent(inputValue)
    } else {
      setPercent('')
    }
  }, [inputValue])
  return (
    <div style={{ marginTop: 15 }}>
      <BetweenStack>
        <WithdrawPercentage>
          {percentValue.map((value, index) => (
            <PercentButton
              isActive={percentValue[index] === selectedPercent}
              onClick={() => {
                setPercent(value)
                setInputValue(value)
              }}
              key={value}
            >
              <span>{value}%</span>
            </PercentButton>
          ))}
        </WithdrawPercentage>
        <SelectedPercentBox>
          <span>
            <Input type="number" onChange={(e) => setInputValue(e.target.value)} value={inputValue} min={0} max={100} />
            <p>%</p>
          </span>
        </SelectedPercentBox>
      </BetweenStack>
    </div>
  )
}
interface IOption {
  value: number
  label: 'Combo' | 'DEUS' | 'vDEUS'
}
const WithdrawCombo = () => {
  const [selectedValue, setSelectedValue] = useState<number>()
  const options: IOption[] = [
    { label: 'Combo', value: 0 },
    { label: 'DEUS', value: 1 },
    { label: 'vDEUS', value: 2 },
  ]
  return (
    <div style={{ marginTop: 24 }}>
      <WithdrawHeading>Withdraw in</WithdrawHeading>
      <RadioContainer>
        {options.map((option) => (
          <HStack key={option.value}>
            <RadioButton
              checked={option.value === selectedValue}
              id={`option${option.value}`}
              type="radio"
              value={option.value}
              onChange={(e) => setSelectedValue(+e.currentTarget.value)}
            />
            <label htmlFor={`option${option.value}`}>{option.label}</label>
          </HStack>
        ))}
      </RadioContainer>
    </div>
  )
}
export default function LiquidityPool({ pool, action }: { pool: LiquidityType; action: ActionTypes }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const [amountIn2, setAmountIn2] = useState('')
  const [lpAmountIn, setLPAmountIn] = useState('')
  const [selected, setSelected] = useState<ActionTypes>(action)
  const isRemove = useMemo(() => selected == ActionTypes.REMOVE, [selected])
  const [slippage, setSlippage] = useState(0.5)

  const stakingPool = pool
  const token0Currency = stakingPool.tokens[0]
  const token1Currency = stakingPool.tokens[1]
  const lpCurrency = pool.lpToken

  const token0CurrencyBalance = useCurrencyBalance(account ?? undefined, token0Currency)
  const token1CurrencyBalance = useCurrencyBalance(account ?? undefined, token1Currency)
  const lpCurrencyBalance = useCurrencyBalance(account ?? undefined, lpCurrency)

  const debouncedAmountIn = useDebounce(amountIn, 500)
  const debouncedAmountIn2 = useDebounce(amountIn2, 500)
  const debouncedLPAmountIn = useDebounce(lpAmountIn, 500)

  const amountOut = useRemoveLiquidity(stakingPool, debouncedLPAmountIn)
  const amountOut2 = useAddLiquidity(stakingPool, [debouncedAmountIn, debouncedAmountIn2]).toString()

  useEffect(() => {
    if (selected === ActionTypes.ADD) {
      setLPAmountIn(amountOut2)
    } else {
      setAmountIn(amountOut[0]?.toString())
      setAmountIn2(amountOut[1]?.toString())
    }
  }, [selected, amountOut2, amountOut])

  useEffect(() => {
    if (selected === ActionTypes.ADD) {
      setAmountIn('')
      setAmountIn2('')
    } else {
      setLPAmountIn('')
    }
  }, [selected])

  const token0Amount = useMemo(() => {
    return tryParseAmount(amountIn, token0Currency || undefined)
  }, [amountIn, token0Currency])

  const token1Amount = useMemo(() => {
    return tryParseAmount(amountIn2, token1Currency || undefined)
  }, [amountIn2, token1Currency])

  const lpAmount = useMemo(() => {
    return tryParseAmount(lpAmountIn, lpCurrency || undefined)
  }, [lpAmountIn, lpCurrency])

  const token0InsufficientBalance = useMemo(() => {
    if (!token0Amount) return false
    return token0CurrencyBalance?.lessThan(token0Amount)
  }, [token0CurrencyBalance, token0Amount])

  const token1InsufficientBalance = useMemo(() => {
    if (!token1Amount) return false
    return token1CurrencyBalance?.lessThan(token1Amount)
  }, [token1CurrencyBalance, token1Amount])

  const lpInsufficientBalance = useMemo(() => {
    if (!lpAmount) return false
    return lpCurrencyBalance?.lessThan(lpAmount)
  }, [lpCurrencyBalance, lpAmount])

  const {
    state: liquidityCallbackState,
    callback: liquidityCallback,
    error: liquidityCallbackError,
  } = useManageLiquidity(
    isRemove ? amountOut : [debouncedAmountIn, debouncedAmountIn2],
    isRemove ? lpAmountIn : amountOut2,
    stakingPool,
    slippage,
    20,
    isRemove
  )

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)
  const [awaitingLiquidityConfirmation, setAwaitingLiquidityConfirmation] = useState(false)
  // TODO: check the spender
  const spender = useMemo(() => (chainId ? stakingPool.contract : undefined), [chainId, stakingPool.contract])

  const [approvalState, approveCallback] = useApproveCallback(token1Currency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = token1Currency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [token1Currency, approvalState, amountIn])

  const [approvalState2, approveCallback2] = useApproveCallback(token0Currency ?? undefined, spender)
  const [showApprove2, showApproveLoader2] = useMemo(() => {
    const show = token0Currency && approvalState2 !== ApprovalState.APPROVED && !!amountIn2
    return [show, show && approvalState2 === ApprovalState.PENDING]
  }, [token0Currency, approvalState2, amountIn2])

  const [approvalState3, approveCallback3] = useApproveCallback(lpCurrency ?? undefined, spender)
  const [showApprove3, showApproveLoader3] = useMemo(() => {
    const show = lpCurrency && approvalState3 !== ApprovalState.APPROVED && !!lpAmountIn
    return [show, show && approvalState3 === ApprovalState.PENDING]
  }, [lpCurrency, approvalState3, lpAmountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleApprove2 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback2()
    setAwaitingApproveConfirmation(false)
  }

  const handleApprove3 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback3()
    setAwaitingApproveConfirmation(false)
  }

  const handleLiquidity = useCallback(async () => {
    console.log('called handleLiquidity')
    console.log(liquidityCallbackState, liquidityCallbackError)
    if (!liquidityCallback) return
    try {
      setAwaitingLiquidityConfirmation(true)
      const txHash = await liquidityCallback()
      setAwaitingLiquidityConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingLiquidityConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [liquidityCallbackState, liquidityCallback, liquidityCallbackError])

  function getApproveButton(type: string): JSX.Element | null {
    if (!isSupportedChainId || !account || !type) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <DepositButton active>
          Awaiting Confirmation <DotFlashing />
        </DepositButton>
      )
    }
    if (showApproveLoader || showApproveLoader2 || showApproveLoader3) {
      return (
        <DepositButton active>
          Approving <DotFlashing />
        </DepositButton>
      )
    }
    if (showApprove && type === ActionTypes.ADD) {
      return <DepositButton onClick={handleApprove}>Allow us to spend {token1Currency?.symbol}</DepositButton>
    }
    if (showApprove2 && type === ActionTypes.ADD) {
      return <DepositButton onClick={handleApprove2}>Allow us to spend {token0Currency?.symbol}</DepositButton>
    }
    if (showApprove3 && type === ActionTypes.REMOVE) {
      return <DepositButton onClick={handleApprove3}>Allow us to spend {lpCurrency?.symbol}</DepositButton>
    }
    return null
  }

  function getActionButton(type: string): JSX.Element | null {
    if (!chainId || !account || !type) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    }
    if ((showApprove || showApprove2) && type === ActionTypes.ADD) {
      return null
    }
    if (showApprove3 && type === ActionTypes.REMOVE) {
      return null
    }
    if (token0InsufficientBalance && type === ActionTypes.ADD) {
      return <DepositButton disabled>Insufficient {token0Currency?.symbol} Balance</DepositButton>
    }
    if (token1InsufficientBalance && type === ActionTypes.ADD) {
      return <DepositButton disabled>Insufficient {token1Currency?.symbol} Balance</DepositButton>
    }
    if (lpInsufficientBalance && type === ActionTypes.REMOVE) {
      return <DepositButton disabled>Insufficient {lpCurrency?.symbol} Balance</DepositButton>
    }
    if (awaitingLiquidityConfirmation) {
      return (
        <DepositButton>
          {type === ActionTypes.ADD ? 'Depositing ' : 'Withdrawing '}
          {token0Currency?.symbol}/{token1Currency?.symbol}
          <DotFlashing />
        </DepositButton>
      )
    }
    return (
      <DepositButton onClick={() => handleLiquidity()}>
        {type === ActionTypes.ADD ? 'Deposit' : 'Withdraw'}
      </DepositButton>
    )
  }

  const getAppComponent = (): JSX.Element => {
    const tokens = pool?.tokens
    if (selected == ActionTypes.REMOVE) {
      return (
        <>
          {/* <InputBox currency={lpCurrency} value={lpAmountIn} onChange={(value: string) => setLPAmountIn(value)} /> */}
          <BetweenStack>
            <WithdrawText>Whitdraw percentage</WithdrawText>
            <WithdrawText>LP Staked: 488.335</WithdrawText>
          </BetweenStack>
          <PercentBox />
          <WithdrawCombo />
          <ArrowDown style={{ margin: '12px auto' }} />

          <InputBox currency={tokens[0]} value={amountIn} onChange={(value: string) => console.log(value)} disabled />

          {tokens[1] && (
            <>
              <div style={{ marginTop: '20px' }}></div>
              <InputBox
                currency={tokens[1]}
                value={amountIn2}
                onChange={(value: string) => console.log(value)}
                disabled
              />
            </>
          )}

          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton(ActionTypes.REMOVE)}
          {getActionButton(ActionTypes.REMOVE)}
        </>
      )
    } else {
      return (
        <>
          <InputBox currency={tokens[0]} value={amountIn} onChange={(value: string) => setAmountIn(value)} />

          {tokens[1] && (
            <>
              <div style={{ marginTop: '20px' }}></div>
              <InputBox currency={tokens[1]} value={amountIn2} onChange={(value: string) => setAmountIn2(value)} />
            </>
          )}

          <ArrowDown style={{ margin: '12px auto' }} />

          <InputBox
            currency={lpCurrency}
            value={lpAmountIn}
            onChange={(value: string) => console.log(value)}
            disabled
          />

          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton(ActionTypes.ADD)}
          {getActionButton(ActionTypes.ADD)}
        </>
      )
    }
  }

  return (
    <Wrapper>
      <ToggleState>
        <ActionSetter selected={selected} setSelected={setSelected} />
        <Divider backgroundColor="#101116" />
      </ToggleState>

      {getAppComponent()}
    </Wrapper>
  )
}
