import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useSwapCallback from 'hooks/useSwapCallback'
import { useSwapAmountsOut } from 'hooks/useSwapPage'
import { tryParseAmount } from 'utils/parse'

import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import InputBox from 'components/App/Redemption/InputBox'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { SwapFlashLoan } from 'constants/addresses'
import { BDEI_TOKEN, DEI_TOKEN } from 'constants/tokens'
import { NavigationTypes } from 'components/StableCoin'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 15px;
`

export default function SwapPage({ onSwitch }: { onSwitch: any }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const bdeiCurrency = BDEI_TOKEN
  const bDeiCurrencyBalance = useCurrencyBalance(account ?? undefined, bdeiCurrency)
  const { amountOut } = useSwapAmountsOut(debouncedAmountIn, deiCurrency)

  // Amount typed in either fields
  const bdeiAmount = useMemo(() => {
    return tryParseAmount(amountIn, bdeiCurrency || undefined)
  }, [amountIn, bdeiCurrency])

  const deiAmount = useMemo(() => {
    return tryParseAmount(amountOut, deiCurrency || undefined)
  }, [amountOut, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!bdeiAmount) return false
    return bDeiCurrencyBalance?.lessThan(bdeiAmount)
  }, [bDeiCurrencyBalance, bdeiAmount])

  const {
    state: swapCallbackState,
    callback: swapCallback,
    error: swapCallbackError,
  } = useSwapCallback(bdeiCurrency, deiCurrency, bdeiAmount, deiAmount, slippage, 20)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? SwapFlashLoan[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(bdeiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = bdeiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [bdeiCurrency, approvalState, amountIn])

  // const { diff } = getRemainingTime(swapTranche.endTime)

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleSwap = useCallback(async () => {
    console.log('called handleSwap')
    console.log(swapCallbackState, swapCallback, swapCallbackError)
    if (!swapCallback) return

    // let error = ''
    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await swapCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [swapCallbackState, swapCallback, swapCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <RedeemButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApproveLoader) {
      return (
        <RedeemButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApprove) {
      return <RedeemButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</RedeemButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <RedeemButton onClick={toggleWalletModal}>Connect Wallet</RedeemButton>
    }
    if (showApprove) {
      return null
    }
    if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {bdeiCurrency?.symbol} Balance</RedeemButton>
    }
    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Swapping <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleSwap()}>Swap</RedeemButton>
  }

  return (
    <>
      <Wrapper>
        <InputBox
          currency={bdeiCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
        />
        <ArrowDown style={{ cursor: 'pointer' }} onClick={() => onSwitch(NavigationTypes.MINT)} />

        <InputBox
          currency={deiCurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
    </>
  )
}
