import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
// import CLQDR_ICON from '/public/static/images/pages/swap/tableauBackground.svg'

import { Swap as SwapIcon } from 'components/Icons'
import { LQDR_TOKEN, cLQDR_TOKEN, DEUS_TOKEN, DEI_TOKEN, BDEI_TOKEN } from 'constants/tokens'
import { CLQDR_ADDRESS } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'
import { formatBalance, toBN } from 'utils/numbers'
import { useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useDepositLQDRCallback } from 'hooks/useClqdrCallback'
import { useCalcSharesFromAmount, useFetchFirebirdData } from 'hooks/useClqdrPage'
import useDebounce from 'hooks/useDebounce'

import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import DefaultReviewModal from 'components/App/CLqdr/DefaultReviewModal'
import {
  BottomWrapper,
  Container,
  InputWrapper,
  Wrapper as MainWrapper,
  MainButton,
  ConnectWallet,
} from 'components/App/StableCoin'
import Tableau from 'components/App/StableCoin/Tableau'
import WarningModal from 'components/ReviewModal/Warning'
import AdvancedOptions from 'components/ReviewModal/AdvancedOptions'
import { useUserSlippageTolerance, useSetUserSlippageTolerance } from 'state/user/hooks'
import TokensModal from 'components/App/Swap/TokensModal'
import { Currency, Token } from '@sushiswap/core-sdk'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import Question from '/public/static/images/pages/swap/Union.svg'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import { ToolTip } from 'components/ToolTip'

const Wrapper = styled(MainWrapper)`
  margin-top: 68px;
`
const InputContainer = styled.div`
  width: 100%;
  margin-top: 2px;
  & > div:first-of-type {
    background-color: ${({ theme }) => theme.bg1};
  }
`
const TableauContainer = styled(RowCenter)`
  align-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  & > div:first-of-type {
    background-color: ${({ theme }) => theme.bg1};
    display: inline-block;
    width: 60px;
    span {
      margin-right: 4px !important;
      display: inline-block;
      font-size: 1.25rem;
      font-weight: 600;
      color: ${({ theme }) => theme.text1};
    }
  }
`
export default function Swap() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)
  const [isOpenTokensModal, toggleTokensModal] = useState(false)

  // const [currentField, setCurrentField] = useState<Field>(Field.INPUT)
  // const currentFieldSide = useMemo(() => (currentField === Field.INPUT ? Field.OUTPUT : Field.INPUT), [currentField])
  // const { allowedSlippage, parsedAmount, currencies, trade, inputError: swapInputError } = useDerivedSwapInfo()

  const [inputCurrency, setInputCurrency] = useState<Token>(DEI_TOKEN)
  const [outputCurrency, setOutputCurrency] = useState<Token>(BDEI_TOKEN)
  // const inputCurrency = LQDR_TOKEN
  // const outputCurrency = cLQDR_TOKEN
  const [field, setField] = useState('')

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency)

  const [amount, setAmount] = useState('')
  const debouncedAmount = useDebounce(amount, 500)
  const amountOutBN = useCalcSharesFromAmount(amount)

  const formattedAmountOut = amountOutBN == '' ? '0' : toBN(amountOutBN).div(1e18).toFixed()

  const firebird = useFetchFirebirdData(debouncedAmount)

  const token1Amount = useMemo(() => {
    return tryParseAmount(amount, inputCurrency || undefined)
  }, [amount, inputCurrency])

  const insufficientBalance = useMemo(() => {
    if (!token1Amount) return false
    return inputCurrencyBalance?.lessThan(token1Amount)
  }, [inputCurrencyBalance, token1Amount])

  const { state: mintCallbackState, callback: mintCallback, error: mintCallbackError } = useDepositLQDRCallback(amount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMintConfirmation, setAwaitingMintConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? CLQDR_ADDRESS[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amount
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amount])

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
      setAmount('')
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
  }, [mintCallback, mintCallbackError, mintCallbackState])

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
    else if (awaitingMintConfirmation) {
      return (
        <MainButton>
          Minting {outputCurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }
    return (
      <MainButton
        onClick={() => {
          if (amount !== '0' && amount !== '' && amount !== '0.') toggleReviewModal(true)
        }}
      >
        {/* Mint {outputCurrency?.symbol} */}
        Swap
      </MainButton>
    )
  }
  const deiPrice = useDeiPrice()
  const deusPrice = useDeusPrice()
  const items = useMemo(
    () => [
      { name: 'DEI Price', value: `$${formatBalance(deiPrice, 3)}` },
      { name: 'VDEUS Price', value: `$${formatBalance(deusPrice, 4)}` },
      { name: 'DEUS Price', value: `$${formatBalance(deusPrice, 4)}` },
    ],
    []
  )

  const slippageInfo =
    'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.'

  function setToken(currency: Currency) {
    field === 'input' ? setInputCurrency(currency as unknown as Token) : setOutputCurrency(currency as unknown as Token)
    setField('')
  }

  function handleClick() {
    const currency = inputCurrency
    setInputCurrency(outputCurrency)
    setOutputCurrency(currency)
  }
  useWeb3NavbarOption({ reward: true, wallet: true, network: true })

  return (
    <>
      <Container>
        <Wrapper>
          <TableauContainer>
            <Tableau title={'Swap'} />
            <ToolTip id="id" />
            <ImageWithFallback
              data-for="id"
              data-tip={slippageInfo}
              alt="question"
              src={Question}
              width={16}
              height={16}
            />
          </TableauContainer>
          <InputContainer>
            <InputWrapper>
              <InputBox
                currency={inputCurrency}
                value={amount}
                onChange={setAmount}
                onTokenSelect={() => {
                  toggleTokensModal(true)
                  setField('input')
                }}
              />

              <SwapIcon onClick={handleClick} />

              <InputBox
                currency={outputCurrency}
                value={formattedAmountOut == '0' ? '' : formattedAmountOut}
                onChange={() => console.log('')}
                onTokenSelect={() => {
                  toggleTokensModal(true)
                  setField('output')
                }}
                disabled
              />
              <div style={{ marginTop: '30px' }}></div>
              {getApproveButton()}
              {getActionButton()}
            </InputWrapper>

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
          </InputContainer>
        </Wrapper>
      </Container>

      <TokensModal
        isOpen={isOpenTokensModal}
        tokens={[LQDR_TOKEN, cLQDR_TOKEN, DEUS_TOKEN, DEI_TOKEN]}
        toggleModal={(action: boolean) => toggleTokensModal(action)}
        selectedTokenIndex={field === 'input' ? inputCurrency : outputCurrency}
        setToken={setToken}
      />

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', `Minting ${amount} cLQDR by ${amount} LQDR`]}
      />

      <DefaultReviewModal
        title="Review Mint Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[LQDR_TOKEN]}
        outputTokens={[cLQDR_TOKEN]}
        amountsIn={[amount]}
        amountsOut={[formattedAmountOut]}
        info={[]}
        data={''}
        buttonText={'Confirm Mint'}
        awaiting={awaitingMintConfirmation}
        summary={`Minting ${formattedAmountOut} cLQDR by ${amount} LQDR`}
        handleClick={handleMint}
      />
    </>
  )
}
