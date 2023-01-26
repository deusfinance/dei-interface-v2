import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'

import { SupportedChainId } from 'constants/chains'
import { DEUS_TOKEN } from 'constants/tokens'
import { MINT__INPUTS, MINT__OUTPUTS } from 'constants/inputs'
import { CollateralPool } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useExpiredPrice, useMintingFee, useMintPaused } from 'state/dei/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useMintPage } from 'hooks/useMintPage'
import useMintCallback from 'hooks/useMintCallback'
import useUpdateCallback from 'hooks/useOracleCallback'
import { useGetCollateralRatios } from 'hooks/useRedemptionPage'

import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
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
import TokensModal from 'components/App/StableCoin/TokensModal'
import WarningModal from 'components/ReviewModal/Warning'
import { RowCenter } from 'components/Row'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import Column from 'components/Column'

const MainContainer = styled(Container)`
  margin-top: 68px;
`
const PlusIcon = styled(Plus)`
  z-index: 1000;
  padding: 3px;
  border: 1px solid ${({ theme }) => theme.bg4};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text2};
  position: absolute;
`

const ComboInputBox = styled.div`
  position: relative;
  width: 100%;
  & > * {
    &:nth-child(1) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:nth-child(2) {
      margin: -12px auto -12px 57px;
    }
    &:nth-child(3) {
      margin-top: -1px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    & > * {
      &:nth-child(2) {
        margin: -12px auto -12px 62px;
      }
    }
  `}
`
const TableauContainer = styled(RowCenter)`
  align-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  & > div {
    background-color: ${({ theme }) => theme.bg1};
  }
  span {
    font-size: 20px;
  }
`

const InputContainer = styled.div`
  width: 100%;
  margin-top: 2px;
  & > div:first-of-type {
    padding: 22px 16px 24px;
    background-color: ${({ theme }) => theme.bg1};
  }
`

const ArrowContainer = styled(RowCenter)`
  border: 1px solid ${({ theme }) => theme.text2};
  width: fit-content;
  padding: 3px 12px;
  border-radius: 4px;
  & > p {
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.text2};
    margin-right: 24px;
  }
  & > svg {
    color: ${({ theme }) => theme.text2};
  }
`
const BottomContainer = styled(BottomWrapper)`
  margin-top: 2px;
  padding: 20px 16px;
  & > * {
    font-weight: 500;
  }
`
const ActionButton = styled.div`
  width: 100%;
  & > div {
    background: linear-gradient(90deg, #e0974c 0%, #c93f6f 100%);
    &:hover {
      background: linear-gradient(270deg, #e0974c 0%, #c93f6f 100%);

      & > div {
        background: linear-gradient(270deg, #e0974c 0%, #c93f6f 100%);
      }
    }
    & > div {
      background: linear-gradient(90deg, #e0974c 0%, #c93f6f 100%);
      & > span {
        color: white;
        background: transparent;
        -webkit-text-fill-color: white;
      }
    }
  }
`
const ActionButtonContainer = styled(Column)`
  row-gap: 8px;
  width: 100%;
`
export default function Mint() {
  useWeb3NavbarOption({ reward: true, wallet: true, network: true })
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()
  const mintingFee = useMintingFee()
  const mintPaused = useMintPaused()
  const tokens = useMemo(
    () => MINT__INPUTS[isSupportedChainId && chainId ? chainId : SupportedChainId.FANTOM],
    [chainId, isSupportedChainId]
  )

  const [fullCollateralIndex, partialCollateralIndex] = useMemo(() => {
    let fullCollateralIndex = tokens?.indexOf(
      tokens.filter((item) => {
        return item.length === 1 && item[0]?.symbol === 'USDC'
      })[0]
    )
    let partialCollateralIndex = tokens?.indexOf(
      tokens.filter((item) => {
        return item.length > 1 && item[0]?.symbol === 'USDC' && item[1]?.symbol === 'DEUS'
      })[0]
    )
    if (fullCollateralIndex === -1) fullCollateralIndex = 1
    if (partialCollateralIndex === -1) partialCollateralIndex = 0
    return [fullCollateralIndex, partialCollateralIndex]
  }, [tokens])

  const [isOpenTokensModal, toggleTokensModal] = useState(false)
  const [inputTokenIndex, setInputTokenIndex] = useState<number>(fullCollateralIndex)
  const [hasPair, setHasPair] = useState(!!inputTokenIndex)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)

  const expiredPrice = useExpiredPrice()

  const inputToken = tokens[inputTokenIndex]
  const token1Currency = inputToken[0]
  const token2Currency = hasPair ? inputToken[1] : DEUS_TOKEN

  const tokensOut = useMemo(
    () => MINT__OUTPUTS[isSupportedChainId && chainId ? chainId : SupportedChainId.FANTOM],
    [chainId, isSupportedChainId]
  )
  const outputToken = tokensOut[0]
  const outputTokenCurrency = outputToken[0]

  const token1CurrencyBalance = useCurrencyBalance(account ?? undefined, token1Currency)
  const token2CurrencyBalance = useCurrencyBalance(account ?? undefined, token2Currency)

  const { mintCollateralRatio, redeemCollateralRatio } = useGetCollateralRatios()

  const { amountIn1, amountIn2, amountOut, onUserInput1, onUserInput2, onUserOutput } = useMintPage(
    token1Currency,
    token2Currency,
    outputTokenCurrency
  )

  useEffect(() => {
    if (Number(mintCollateralRatio) === 100) {
      setHasPair(false)
      setInputTokenIndex(fullCollateralIndex)
    } else if (Number(mintCollateralRatio) < 100 && Number(mintCollateralRatio) > 0) {
      setHasPair(true)
      setInputTokenIndex(partialCollateralIndex)
    }
  }, [fullCollateralIndex, mintCollateralRatio, partialCollateralIndex])

  const token1Amount = useMemo(() => {
    return tryParseAmount(amountIn1, token1Currency || undefined)
  }, [amountIn1, token1Currency])

  const token2Amount = useMemo(() => {
    return tryParseAmount(amountIn2, token2Currency || undefined)
  }, [amountIn2, token2Currency])

  const insufficientBalance1 = useMemo(() => {
    if (!token1Amount) return false
    return token1CurrencyBalance?.lessThan(token1Amount)
  }, [token1CurrencyBalance, token1Amount])

  const insufficientBalance2 = useMemo(() => {
    if (!token2Amount) return false
    if (!hasPair) return false
    return token2CurrencyBalance?.lessThan(token2Amount)
  }, [token2Amount, hasPair, token2CurrencyBalance])

  const deiAmount = useMemo(() => {
    return tryParseAmount(amountOut, outputTokenCurrency || undefined)
  }, [amountOut, outputTokenCurrency])

  const { state: mintCallbackState, callback: mintCallback, error: mintCallbackError } = useMintCallback(deiAmount)
  const { callback: updateOracleCallback } = useUpdateCallback()
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMintConfirmation, setAwaitingMintConfirmation] = useState<boolean>(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? CollateralPool[chainId] : undefined), [chainId])
  const [approvalState1, approveCallback1] = useApproveCallback(token1Currency ?? undefined, spender)
  const [approvalState2, approveCallback2] = useApproveCallback(token2Currency ?? undefined, spender)

  const [showApprove1, showApproveLoader1] = useMemo(() => {
    const show = token1Currency && approvalState1 !== ApprovalState.APPROVED && !!amountIn1
    return [show, show && approvalState1 === ApprovalState.PENDING]
  }, [token1Currency, approvalState1, amountIn1])

  const [showApprove2, showApproveLoader2] = useMemo(() => {
    if (!hasPair) return [false, false]
    const show = token2Currency && approvalState2 !== ApprovalState.APPROVED && !!amountIn2 && Number(amountIn2) !== 0
    return [show, show && approvalState2 === ApprovalState.PENDING]
  }, [hasPair, token2Currency, approvalState2, amountIn2])

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
      onUserInput1('')
    }
  }, [expiredPrice, onUserInput1])

  const handleApprove = async (focusType: string) => {
    setAwaitingApproveConfirmation(true)
    if (focusType === '2') await approveCallback2()
    else await approveCallback1()
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
      onUserInput1('')
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
  }, [mintCallback, mintCallbackError, mintCallbackState, onUserInput1])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) return null
    else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      )
    } else if (showApproveLoader1 || showApproveLoader2) {
      return (
        <MainButton active>
          Approving <DotFlashing />
        </MainButton>
      )
    } else if (showApprove1)
      return <MainButton onClick={() => handleApprove('1')}>Allow us to spend {token1Currency?.symbol}</MainButton>
    else if (showApprove2)
      return <MainButton onClick={() => handleApprove('2')}>Allow us to spend {token2Currency?.symbol}</MainButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    else if (showApprove1 || showApprove2) return null
    else if (insufficientBalance1)
      return <MainButton disabled>Insufficient {token1Currency?.symbol} Balance</MainButton>
    else if (insufficientBalance2)
      return <MainButton disabled>Insufficient {token2Currency?.symbol} Balance</MainButton>
    else if (mintPaused) {
      return <MainButton disabled>Mint Paused</MainButton>
    } else if (awaitingUpdateConfirmation) {
      return <GradientButton title={'Updating Oracle'} awaiting />
    } else if (expiredPrice) {
      return <GradientButton onClick={handleUpdatePrice} title={'Update Oracle'} />
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
          if (amountOut !== '0' && amountOut !== '' && amountOut !== '0.') toggleReviewModal(true)
        }}
      >
        Mint
      </MainButton>
    )
  }

  return (
    <>
      <MainContainer>
        <Wrapper>
          <TableauContainer>
            <Tableau title={'Mint DEI'} />
          </TableauContainer>
          <InputContainer>
            <InputWrapper>
              {inputToken.length > 1 ? (
                <ComboInputBox>
                  <InputBox
                    currency={token1Currency}
                    value={amountIn1}
                    onChange={(value: string) => onUserInput1(value)}
                    disabled={expiredPrice}
                    // onTokenSelect={() => {
                    //   toggleTokensModal(true)
                    //   setInputTokenIndex(inputTokenIndex)
                    // }}
                  />
                  <PlusIcon size={'24px'} />
                  <InputBox
                    currency={token2Currency}
                    value={amountIn2}
                    onChange={(value: string) => onUserInput2(value)}
                    disabled={expiredPrice}

                    // onTokenSelect={() => {
                    //   toggleTokensModal(true)
                    //   setInputTokenIndex(inputTokenIndex)
                    // }}
                  />
                </ComboInputBox>
              ) : (
                <InputBox
                  currency={token1Currency}
                  value={amountIn1}
                  onChange={(value: string) => onUserInput1(value)}
                  disabled={expiredPrice}
                  // onTokenSelect={() => {
                  //   toggleTokensModal(true)
                  //   setInputTokenIndex(inputTokenIndex)
                  // }}
                />
              )}
              <ArrowContainer>
                <p>Mint DEI</p>
                <ArrowDown />
              </ArrowContainer>
              <InputBox
                currency={outputTokenCurrency}
                value={amountOut}
                onChange={(value: string) => onUserOutput(value)}
                disabled={expiredPrice}
              />
              <div style={{ marginTop: '30px' }}></div>
              <ActionButtonContainer>
                <ActionButton>{getApproveButton()}</ActionButton>
                <ActionButton>{getActionButton()}</ActionButton>
              </ActionButtonContainer>
            </InputWrapper>
          </InputContainer>

          <BottomContainer>
            <InfoItem name={'Minting Fee:'} value={mintingFee == 0 ? 'Zero' : `${mintingFee}%`} />
            <InfoItem name={'Mint Ratio:'} value={Number(mintCollateralRatio).toString() + '%'} />
            <InfoItem name={'Redeem Ratio:'} value={Number(redeemCollateralRatio).toString() + '%'} />
          </BottomContainer>
        </Wrapper>
        <TokensModal
          isOpen={isOpenTokensModal}
          toggleModal={(action: boolean) => toggleTokensModal(action)}
          selectedTokenIndex={inputTokenIndex}
          setToken={setInputTokenIndex}
        />
      </MainContainer>

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', `Minting ${amountOut} DEI by ${amountIn1} USDC`]}
      />

      <DefaultReviewModal
        title="Review Mint Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={inputToken}
        outputTokens={outputToken}
        amountsIn={[amountIn1, amountIn2]}
        amountsOut={[amountOut]}
        info={[]}
        data={''}
        buttonText={'Confirm Mint'}
        awaiting={awaitingMintConfirmation}
        summary={`Minting ${amountOut} DEI by ${amountIn1} USDC`}
        handleClick={handleMint}
      />
    </>
  )
}
