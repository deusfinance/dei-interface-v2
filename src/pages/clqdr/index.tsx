import React, { useState, useMemo, useCallback } from 'react'
import { ArrowDown } from 'react-feather'
import styled from 'styled-components'
import { darken } from 'polished'
import Image from 'next/image'

import CLQDR_LOGO from '/public/static/images/pages/clqdr/ic_lqdr_header.svg'
import CLQDR_ICON from '/public/static/images/pages/clqdr/ic_clqdr.svg'

import { LQDR_TOKEN, cLQDR_TOKEN } from 'constants/tokens'
import { CLQDR_ADDRESS } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'
import { formatBalance, toBN } from 'utils/numbers'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useDepositLQDRCallback } from 'hooks/useClqdrCallback'
import { useCalcSharesFromAmount, useClqdrData, useFetchFirebirdData } from 'hooks/useClqdrPage'
import useDebounce from 'hooks/useDebounce'

import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import InputBox from 'components/InputBox'
import StatsHeader from 'components/App/CLqdr/StatsHeader'
import DefaultReviewModal from 'components/App/CLqdr/DefaultReviewModal'
import {
  BottomWrapper,
  Container,
  InputWrapper,
  Wrapper as MainWrapper,
  MainButton as MainButtonWrap,
  ConnectWallet,
} from 'components/App/StableCoin'
import { RowCenter } from 'components/Row'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/CLqdr/Tableau'
import WarningModal from 'components/ReviewModal/Warning'
// import FireBird1 from 'components/App/CLqdr/FireBirdBox1'

import FireBird3 from 'components/App/CLqdr/FirebirdBox3'
import FireBird1 from 'components/App/CLqdr/FirebirdBox1'

const Wrapper = styled(MainWrapper)`
  margin-top: 16px;
`
const MainButton = styled(MainButtonWrap)`
  background: ${({ theme }) => theme.cLqdrColor};
  color: ${({ theme, disabled }) => (disabled ? theme.white : theme.black)};

  &:hover {
    background: ${({ theme }) => darken(0.1, theme.cLqdrColor)};
  }

  ${({ theme, disabled }) =>
    disabled &&
    `
      background: ${theme.bg2};
      border: 1px solid ${theme.border1};
      cursor: default;

      &:focus,
      &:hover {
        background: ${theme.bg2};
      }
  `}
`

const ArrowBox = styled(RowCenter)`
  width: 84px;
  height: 27px;
  border-radius: 4px;
  white-space: nowrap;
  justify-content: center;
  padding: 3px 8px 4px 12px;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.text1};
`

export default function Mint() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const { burningFee, mintRate } = useClqdrData()

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)

  const inputCurrency = LQDR_TOKEN
  const outputCurrency = cLQDR_TOKEN

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
        Mint {outputCurrency?.symbol}
      </MainButton>
    )
  }

  const items = useMemo(
    () =>
      firebird
        ? [
            { name: 'LQDR Price', value: `$${formatBalance(firebird.lqdrPrice, 3)}` },
            { name: 'cLQDR Price', value: `$${formatBalance(firebird.cLqdrPrice, 3)}` },
            { name: 'cLQDR/LQDR Ratio', value: `${formatBalance(mintRate, 4)}` },
          ]
        : [],
    [firebird, mintRate]
  )

  return (
    <>
      <Container>
        <Hero>
          <Image src={CLQDR_LOGO} height={'90px'} alt="Logo" />
          <StatsHeader items={items} />
        </Hero>

        {firebird && firebird.convertRate < mintRate && (
          <FireBird1 ratio={formatBalance(firebird.convertRate, 4) ?? ''} />
        )}

        <Wrapper>
          <Tableau title={'cLQDR'} imgSrc={CLQDR_ICON} />

          <InputWrapper>
            <InputBox
              currency={inputCurrency}
              value={amount}
              onChange={setAmount}
              // onTokenSelect={() => {
              //   toggleTokensModal(true)
              //   setInputTokenIndex(inputTokenIndex)
              // }}
            />
            <ArrowBox>
              Mint
              <ArrowDown style={{ marginLeft: '10px', minWidth: '16px', minHeight: '15px' }} />
            </ArrowBox>
            <InputBox
              currency={outputCurrency}
              value={formattedAmountOut == '0' ? '' : formattedAmountOut}
              onChange={() => console.log('')}
              disabled
            />
            <div style={{ marginTop: '30px' }}></div>
            {getApproveButton()}
            {getActionButton()}
          </InputWrapper>

          <BottomWrapper>
            <InfoItem name={'Management Fee'} value={`${burningFee}%`} />
            <InfoItem
              name={'Firebird'}
              value={amount && Number(amount) > 0 ? `${formatBalance(firebird?.cLqdrAmountOut, 6)} cLQDR` : '-'}
            />
          </BottomWrapper>
        </Wrapper>

        <FireBird3 />
      </Container>

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
