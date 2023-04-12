import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { Swap as SwapIcon } from 'components/Icons'
import { DEUS_TOKEN, XDEUS_TOKEN } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'

import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import {
  BottomWrapper,
  InputWrapper,
  Wrapper as MainWrapper,
  MainButton,
  ConnectWallet,
} from 'components/App/StableCoin'
import WarningModal from 'components/ReviewModal/Warning'
import AdvancedOptions from 'components/ReviewModal/AdvancedOptions'
import { useUserSlippageTolerance, useSetUserSlippageTolerance } from 'state/user/hooks'
import { Token } from '@sushiswap/core-sdk'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import { RowCenter } from 'components/Row'
import useDebounce from 'hooks/useDebounce'
import { StablePools } from 'constants/sPools'
import { useSwapAmountsOut } from 'hooks/useSwapPage'
import ReviewModal from 'components/ReviewModal/ReviewModal'
import useSwapCallback from 'hooks/useSwapCallback'

const Wrapper = styled(MainWrapper)`
  margin-top: 0px;
`
const InputContainer = styled.div`
  border-radius: 16px;
  width: 100%;
  & > div:first-of-type {
    background-color: ${({ theme }) => theme.bg1};
  }
`
const TableauContainer = styled(RowCenter)`
  justify-content: flex-start;
  font-size: 20px;
  font-family: 'IBM Plex Mono';
  background: ${({ theme }) => theme.bg1};
  padding: 16px 24px;
`

const ActionButtonWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 4px 4px;
  gap: 16px;
  flex-direction: column;
`

const SwapWrapper = styled.div`
  border-radius: 10px;
  padding: 12px 10px;
  background: ${({ theme }) => theme.bg7};
  margin: -30px;
  z-index: 1;

  &:hover {
    cursor: pointer;
  }
`

const slippageInfo =
  'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.'

export default function Swap() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)

  const [inputCurrency, setInputCurrency] = useState<Token>(DEUS_TOKEN)
  const [outputCurrency, setOutputCurrency] = useState<Token>(XDEUS_TOKEN)
  const [amount, setAmount] = useState('')
  const [formattedOutputAmount, setFormattedOutputAmount] = useState('')

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingSwapConfirmation, setAwaitingSwapConfirmation] = useState<boolean>(false)

  const debouncedAmount = useDebounce(amount, 500)
  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const token1Amount = useMemo(() => {
    return tryParseAmount(amount, inputCurrency || undefined)
  }, [amount, inputCurrency])
  const token2Amount = useMemo(() => {
    return tryParseAmount(formattedOutputAmount, outputCurrency || undefined)
  }, [formattedOutputAmount, outputCurrency])

  //get stable pool info
  const stablePool = StablePools[1]

  const { amountOut: stablePoolAmountOut } = useSwapAmountsOut(
    debouncedAmount,
    inputCurrency,
    outputCurrency,
    StablePools[1]
  )

  const {
    state: swapCallbackState,
    callback: swapCallback,
    error: swapCallbackError,
  } = useSwapCallback(
    inputCurrency,
    outputCurrency,
    token1Amount,
    token2Amount,
    stablePool,
    Number(useUserSlippageTolerance()),
    20
  )

  useMemo(() => {
    setFormattedOutputAmount(stablePoolAmountOut)
  }, [stablePoolAmountOut])

  const spender = stablePool.swapFlashLoan

  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amount
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amount])

  const summaryText = useMemo(() => {
    return `Converting ${amount} ${inputCurrency.symbol} to ${formattedOutputAmount} ${outputCurrency.symbol}`
  }, [inputCurrency, outputCurrency, amount, formattedOutputAmount])

  const insufficientBalance = useMemo(() => {
    if (!token1Amount) return false
    return inputCurrencyBalance?.lessThan(token1Amount)
  }, [inputCurrencyBalance, token1Amount])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleSwap = useCallback(async () => {
    console.log('called handleSwap')
    console.log(swapCallbackState, swapCallbackError)
    if (!swapCallback) return
    try {
      setAwaitingSwapConfirmation(true)
      const txHash = await swapCallback()
      setAwaitingSwapConfirmation(false)
      console.log({ txHash })
      toggleReviewModal(false)
      setAmount('')
    } catch (e) {
      setAwaitingSwapConfirmation(false)
      toggleWarningModal(true)
      toggleReviewModal(false)
      if (e instanceof Error) {
      } else {
        console.error(e)
      }
    }
  }, [swapCallbackState, swapCallback, swapCallbackError])

  function handleClick() {
    setInputCurrency(outputCurrency)
    setOutputCurrency(inputCurrency)
  }

  function handleInputChange(value: string) {
    // onUserInput1(value)
    setAmount(value)
  }

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) return null
    else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      )
    } else if (showApproveLoader) {
      return (
        <MainButton active>
          Approving <DotFlashing />
        </MainButton>
      )
    } else if (showApprove)
      return <MainButton onClick={() => handleApprove()}>Allow us to spend {inputCurrency?.symbol}</MainButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    else if (showApprove) return null
    else if (insufficientBalance) return <MainButton disabled>Insufficient {inputCurrency?.symbol} Balance</MainButton>

    return (
      <MainButton
        onClick={() => {
          if (amount !== '0' && amount !== '' && amount !== '0.') toggleReviewModal(true)
        }}
      >
        Convert
      </MainButton>
    )
  }

  useWeb3NavbarOption({ reward: true, wallet: true, network: true })

  return (
    <>
      <Wrapper>
        <TableauContainer>Converter</TableauContainer>
        <InputContainer>
          <InputWrapper>
            <InputBox currency={inputCurrency} value={amount} onChange={handleInputChange} />

            <SwapWrapper onClick={handleClick}>
              <SwapIcon color="#83858E" />
            </SwapWrapper>

            <InputBox
              currency={outputCurrency}
              value={formattedOutputAmount}
              onChange={() => {
                console.log()
              }}
              disabled
            />

            <ActionButtonWrapper>
              {getApproveButton()}
              {getActionButton()}
            </ActionButtonWrapper>
          </InputWrapper>
        </InputContainer>
        <BottomWrapper style={{ marginTop: '2px' }}>
          <AdvancedOptions
            amount={useUserSlippageTolerance().toString()}
            setAmount={useSetUserSlippageTolerance()}
            title="Slippage"
            defaultAmounts={['0.1', '0.5', '1.0']}
            unit={'%'}
            toolTipData={slippageInfo}
          />
        </BottomWrapper>
      </Wrapper>

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', summaryText]}
      />

      <ReviewModal
        title={'Review Conversion Transaction'}
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[inputCurrency]}
        outputTokens={[outputCurrency]}
        amountsIn={[amount]}
        amountsOut={[formattedOutputAmount]}
        info={[]}
        data={''}
        buttonText={'Confirm Conversion'}
        awaiting={awaitingSwapConfirmation}
        summary={summaryText}
        handleClick={handleSwap}
      />
    </>
  )
}
