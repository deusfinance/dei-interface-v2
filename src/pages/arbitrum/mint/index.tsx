import React, { useState, useMemo, useCallback } from 'react'
import styled, { useTheme } from 'styled-components'
import { ArrowDown } from 'react-feather'
import Image from 'next/image'

import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'
import DEI_LOGO from '/public/static/images/pages/mint/DEI_Logo.svg'

import { SupportedChainId } from 'constants/chains'
import { MINT__INPUTS, MINT__OUTPUTS } from 'constants/inputs'
import { CollateralPool } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useArbitrumSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useArbitrumMintCallback } from 'hooks/useMintCallback'

import { DotFlashing, Info } from 'components/Icons'
import Hero from 'components/Hero'
import InputBox from 'components/InputBox'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'
import { Container, InputWrapper, Wrapper, MainButton, ConnectWallet, GradientButton } from 'components/App/StableCoin'
import Tableau from 'components/App/StableCoin/Tableau'
import WarningModal from 'components/ReviewModal/Warning'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useArbitrumMintPaused } from 'hooks/useMintPage'

const InfoText = styled.span`
  margin-top: 20px;
  color: ${({ theme }) => theme.error};
  font-size: 14px;
`

export default function Mint() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useArbitrumSupportedChainId()
  const mintPaused = useArbitrumMintPaused()
  const theme = useTheme()

  const rpcChangerCallback = useRpcChangerCallback()

  const tokens = useMemo(
    () => MINT__INPUTS[isSupportedChainId && chainId ? chainId : SupportedChainId.ARBITRUM],
    [chainId, isSupportedChainId]
  )

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)
  const [amountIn, setAmountIn] = useState('')

  const inputToken = tokens[1]
  const token1Currency = inputToken[0]
  const mintMaxValue = 50

  const tokensOut = useMemo(
    () => MINT__OUTPUTS[isSupportedChainId && chainId ? chainId : SupportedChainId.ARBITRUM],
    [chainId, isSupportedChainId]
  )
  const outputToken = tokensOut[0]
  const outputTokenCurrency = outputToken[0]

  const token1CurrencyBalance = useCurrencyBalance(account ?? undefined, token1Currency)

  const token1Amount = useMemo(() => {
    return tryParseAmount(amountIn, token1Currency || undefined)
  }, [amountIn, token1Currency])

  const insufficientBalance1 = useMemo(() => {
    if (!token1Amount) return false
    return token1CurrencyBalance?.lessThan(token1Amount)
  }, [token1CurrencyBalance, token1Amount])

  const usdcAmount = useMemo(() => {
    return tryParseAmount(amountIn, token1Currency || undefined)
  }, [amountIn, token1Currency])

  const {
    state: mintCallbackState,
    callback: mintCallback,
    error: mintCallbackError,
  } = useArbitrumMintCallback(usdcAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMintConfirmation, setAwaitingMintConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? CollateralPool[chainId] : undefined), [chainId])
  const [approvalState1, approveCallback1] = useApproveCallback(token1Currency ?? undefined, spender)

  const [showApprove1, showApproveLoader1] = useMemo(() => {
    const show = token1Currency && approvalState1 !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState1 === ApprovalState.PENDING]
  }, [token1Currency, approvalState1, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback1()
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
      setAmountIn('')
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
  }, [mintCallback, mintCallbackError, mintCallbackState, setAmountIn])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) return null
    else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      )
    } else if (showApproveLoader1) {
      return (
        <MainButton active>
          Approving <DotFlashing />
        </MainButton>
      )
    } else if (showApprove1)
      return <MainButton onClick={() => handleApprove()}>Allow us to spend {token1Currency?.symbol}</MainButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    else if (!isSupportedChainId)
      return (
        <GradientButton title={'Switch to Arbitrum'} onClick={() => rpcChangerCallback(SupportedChainId.ARBITRUM)} />
      )
    else if (showApprove1) return null
    else if (insufficientBalance1)
      return <MainButton disabled>Insufficient {token1Currency?.symbol} Balance</MainButton>
    else if (Number(amountIn) > mintMaxValue) return <MainButton disabled>Exceed amount</MainButton>
    else if (mintPaused) {
      return <MainButton disabled>Mint Paused</MainButton>
    } else if (awaitingMintConfirmation) {
      return (
        <MainButton>
          Minting {outputTokenCurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }
    return (
      <MainButton
        onClick={() => {
          if (amountIn !== '0' && amountIn !== '' && amountIn !== '0.') toggleReviewModal(true)
        }}
      >
        Mint {outputTokenCurrency?.symbol}
      </MainButton>
    )
  }

  return (
    <>
      <Container>
        <Hero>
          <Image src={DEI_LOGO} height={'90px'} alt="Logo" />
        </Hero>

        <Wrapper>
          <Tableau title={'DEI Arbitrum Mint'} imgSrc={MINT_IMG} />

          <InputWrapper>
            <InputBox currency={token1Currency} value={amountIn} onChange={(value: string) => setAmountIn(value)} />
            <ArrowDown />
            <InputBox
              currency={outputTokenCurrency}
              value={amountIn}
              onChange={(value: string) => console.log(value)}
              disabled
            />
            <div style={{ marginTop: '30px' }}></div>
            {getApproveButton()}
            {getActionButton()}
            {Number(amountIn) > mintMaxValue && (
              <InfoText>
                <Info style={{ verticalAlign: 'bottom' }} size={20} color={theme.error} /> You can not mint more than 50
                DEI in a transaction
              </InfoText>
            )}
          </InputWrapper>
        </Wrapper>
      </Container>

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', `Minting ${amountIn} DEI by ${amountIn} USDC`]}
      />

      <DefaultReviewModal
        title="Review Mint Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={inputToken}
        outputTokens={outputToken}
        amountsIn={[amountIn, '']}
        amountsOut={[amountIn]}
        info={[]}
        data={''}
        buttonText={'Confirm Mint'}
        awaiting={awaitingMintConfirmation}
        summary={`Minting ${amountIn} DEI by ${amountIn} USDC`}
        handleClick={handleMint}
      />
    </>
  )
}
