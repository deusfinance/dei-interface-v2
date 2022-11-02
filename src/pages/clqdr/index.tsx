import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { ArrowDown } from 'react-feather'
import Image from 'next/image'

import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'
import DEI_LOGO from '/public/static/images/pages/mint/DEI_Logo.svg'

import { SupportedChainId } from 'constants/chains'
import { DEI_TOKEN } from 'constants/tokens'
import { MINT__OUTPUTS } from 'constants/inputs'
import { CollateralPool } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useExpiredPrice, useMintingFee, useMintPaused } from 'state/dei/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
// import { useMintPage } from 'hooks/useMintPage'
import useMintCallback from 'hooks/useMintCallback'
import useUpdateCallback from 'hooks/useOracleCallback'
import { useGetCollateralRatios } from 'hooks/useRedemptionPage'

import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import InputBox from 'components/InputBox'
import StatsHeader from 'components/StatsHeader'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'
import {
  BottomWrapper,
  Container,
  InputWrapper,
  Wrapper,
  MainButton,
  ConnectWallet,
  GradientButton,
} from 'components/App/StableCoin'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import usePoolStats from 'components/App/StableCoin/PoolStats'
import WarningModal from 'components/ReviewModal/Warning'

export default function Mint() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const mintingFee = useMintingFee()
  const mintPaused = useMintPaused()

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)

  const expiredPrice = useExpiredPrice()

  const inputToken = [DEI_TOKEN]
  const inputCurrency = DEI_TOKEN

  const tokensOut = useMemo(
    () => MINT__OUTPUTS[isSupportedChainId && chainId ? chainId : SupportedChainId.FANTOM],
    [chainId, isSupportedChainId]
  )
  const outputToken = tokensOut[0]
  const outputCurrency = outputToken[0]

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency)

  const { mintCollateralRatio, redeemCollateralRatio } = useGetCollateralRatios()

  // const { amountIn, amountOut, onUserInput, onUserOutput } = useMintPage(inputCurrency, outputCurrency)
  const { amountIn, amountOut, onUserInput, onUserOutput } = {
    amountIn: '0',
    amountOut: '0',
    onUserInput: (value: any) => console.log(value),
    onUserOutput: (value: any) => console.log(value),
  }
  const token1Amount = useMemo(() => {
    return tryParseAmount(amountIn, inputCurrency || undefined)
  }, [amountIn, inputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!token1Amount) return false
    return inputCurrencyBalance?.lessThan(token1Amount)
  }, [inputCurrencyBalance, token1Amount])

  const deiAmount = useMemo(() => {
    return tryParseAmount(amountOut, outputCurrency || undefined)
  }, [amountOut, outputCurrency])

  const { state: mintCallbackState, callback: mintCallback, error: mintCallbackError } = useMintCallback(deiAmount)
  const { callback: updateOracleCallback } = useUpdateCallback()
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMintConfirmation, setAwaitingMintConfirmation] = useState<boolean>(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? CollateralPool[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amountIn])

  const handleUpdatePrice = useCallback(async () => {
    if (!updateOracleCallback) return
    try {
      setAwaitingUpdateConfirmation(true)
      const txHash = await updateOracleCallback()
      console.log({ txHash })
      setAwaitingUpdateConfirmation(false)
    } catch (e) {
      setAwaitingUpdateConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [updateOracleCallback])

  useEffect(() => {
    if (expiredPrice) {
      onUserInput('')
    }
  }, [expiredPrice, onUserInput])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleMint = useCallback(async () => {
    console.log('called handleMint')
    console.log(mintCallbackState, mintCallbackError)
    if (!mintCallback) return
    try {
      setAwaitingMintConfirmation(true)
      const txHash = await mintCallback()
      setAwaitingMintConfirmation(false)
      console.log({ txHash })
      toggleReviewModal(false)
      onUserInput('')
    } catch (e) {
      setAwaitingMintConfirmation(false)
      toggleWarningModal(true)
      toggleReviewModal(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [mintCallback, mintCallbackError, mintCallbackState, onUserInput])

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
    else if (mintPaused) {
      return <MainButton disabled>Mint Paused</MainButton>
    } else if (awaitingUpdateConfirmation) {
      return <GradientButton title={'Updating Oracle'} awaiting />
    } else if (expiredPrice) {
      return <GradientButton onClick={handleUpdatePrice} title={'Update Oracle'} />
    } else if (awaitingMintConfirmation) {
      return (
        <MainButton>
          Minting {outputCurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }
    return (
      <MainButton
        onClick={() => {
          if (amountOut !== '0' && amountOut !== '' && amountOut !== '0.') toggleReviewModal(true)
        }}
      >
        Mint {outputCurrency?.symbol}
      </MainButton>
    )
  }

  const items = usePoolStats()

  return (
    <>
      <Container>
        <Hero>
          <Image src={DEI_LOGO} height={'90px'} alt="Logo" />
          <StatsHeader items={items} />
        </Hero>

        <Wrapper>
          <Tableau title={'Mint DEI'} imgSrc={MINT_IMG} />

          <InputWrapper>
            <InputBox
              currency={inputCurrency}
              value={amountIn}
              onChange={(value: string) => onUserInput(value)}
              disabled={expiredPrice}
              // onTokenSelect={() => {
              //   toggleTokensModal(true)
              //   setInputTokenIndex(inputTokenIndex)
              // }}
            />

            <ArrowDown />
            <InputBox
              currency={outputCurrency}
              value={amountOut}
              onChange={(value: string) => onUserOutput(value)}
              disabled={expiredPrice}
            />
            <div style={{ marginTop: '30px' }}></div>
            {getApproveButton()}
            {getActionButton()}
          </InputWrapper>

          <BottomWrapper>
            <InfoItem name={'Minting Fee'} value={mintingFee == 0 ? 'Zero' : `${mintingFee}%`} />
            <InfoItem name={'Mint Ratio'} value={Number(mintCollateralRatio).toString() + '%'} />
            <InfoItem name={'Redeem Ratio'} value={Number(redeemCollateralRatio).toString() + '%'} />
          </BottomWrapper>
        </Wrapper>
      </Container>

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', `Minting ${amountOut} DEI by ${amountIn} USDC`]}
      />

      <DefaultReviewModal
        title="Review Mint Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={inputToken}
        outputTokens={outputToken}
        amountsIn={[amountIn]}
        amountsOut={[amountOut]}
        info={[]}
        data={''}
        buttonText={'Confirm Mint'}
        awaiting={awaitingMintConfirmation}
        summary={`Minting ${amountOut} DEI by ${amountIn} USDC`}
        handleClick={handleMint}
      />
    </>
  )
}
