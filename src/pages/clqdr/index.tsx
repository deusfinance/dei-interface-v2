import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

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

import { ArrowBubble, DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import {
  Container,
  InputWrapper,
  Wrapper as MainWrapper,
  MainButton as MainButtonWrap,
  ConnectWallet,
} from 'components/App/StableCoin'
import { Row, RowCenter } from 'components/Row'
import Tableau from 'components/App/CLqdr/Tableau'
import WarningModal from 'components/ReviewModal/Warning'
import FireBird1 from 'components/App/CLqdr/FirebirdBox1'
import BalanceBox from 'components/App/CLqdr/BalanceBox'
import BuyClqdrInputBox from 'components/App/CLqdr/BuyClqdrInputBox'
import DataDropdown from 'components/App/CLqdr/DataDropdown'
import ContractsDropdown from 'components/App/CLqdr/ContractsDropdown'
import SingleChart from 'components/App/CLqdr/SingleChart'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'

const Wrapper = styled(MainWrapper)`
  width: 100%;
  margin: unset;
`

const MainButton = styled(MainButtonWrap)`
  margin-top: 8px;
  margin-bottom: 12px;
  background: ${({ theme }) => theme.specialBG1};
  color: ${({ theme, disabled }) => (disabled ? theme.white : theme.black)};

  &:hover {
    background: ${({ theme }) => theme.primary7};
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
const BuyAnyWayButton = styled(MainButtonWrap)<{
  firebird?: boolean
}>`
  margin-top: 8px;
  margin-bottom: 12px;
  &:hover {
    background: ${({ theme }) => theme.primary7};
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
  height: 26px;
  width: 26px;
  border-radius: 14px;
  justify-content: center;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.lqdrColor};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: clamp(250px, 90%, 984px);
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column-reverse
  `}
`

const LeftWrapper = styled(Row)`
  display: flex;
  margin-right: 8px;
  flex-direction: column;
  width: clamp(250px, 90%, 484px);
  & > * {
    margin-top: 16px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:100%;
    margin-right: 0px;

    `}
`

const RightWrapper = styled(Row)`
  display: flex;
  margin-left: 8px;
  flex-direction: column;
  width: clamp(250px, 90%, 484px);
  & > * {
    margin-top: 16px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width:100%;
    margin-left: 0px;
  `}
`

const BackgroundImage = styled.div`
  position: absolute;
  max-width: 720px;
  width: 100%;
  height: 510px;
  background: linear-gradient(90deg, #0badf4 0%, #30efe4 53.12%, #ff9af5 99.99%);
  opacity: 0.1;
  filter: blur(120px);
`

const Dropdowns = styled.div`
  width: 100%;
  & > * {
    width: 100%;
    &:not(:first-child) {
      margin-top: 16px;
    }
  }
`

export default function Mint() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const { mintRate } = useClqdrData()

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
  const buyOnFirebird = useMemo(
    () =>
      formattedAmountOut !== '0' && firebird && firebird.convertRate && toBN(firebird.convertRate).lt(mintRate)
        ? true
        : false,
    [firebird, mintRate, formattedAmountOut]
  )

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
      return buyOnFirebird && amount ? (
        <BuyAnyWayButton>
          Minting {outputCurrency?.symbol} <DotFlashing />
        </BuyAnyWayButton>
      ) : (
        <MainButton>
          Minting {outputCurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }
    return buyOnFirebird && amount ? (
      <BuyAnyWayButton
        firebird
        onClick={() => {
          if (amount !== '0' && amount !== '' && amount !== '0.') toggleReviewModal(true)
        }}
      >
        Mint {outputCurrency?.symbol} Anyway!
      </BuyAnyWayButton>
    ) : (
      <MainButton
        onClick={() => {
          if (amount !== '0' && amount !== '' && amount !== '0.') toggleReviewModal(true)
        }}
      >
        Mint {outputCurrency?.symbol}
      </MainButton>
    )
  }

  return (
    <>
      <Container>
        <ContentWrapper>
          <LeftWrapper>
            {firebird && firebird.convertRate && <FireBird1 mintRate={mintRate} firebirdRate={firebird.convertRate} />}
            <SingleChart uniqueID="clqdrRatio" label="cLQDR/LQDR Ratio" />
            <SingleChart uniqueID="totalSupply" label="cLQDR in Circulation" />

            {/* <PicBox /> */}
            <Dropdowns>
              {/* <DefiWarsDropdown /> */}
              <DataDropdown />
              <ContractsDropdown />
            </Dropdowns>
          </LeftWrapper>
          <RightWrapper>
            <BalanceBox />

            <Wrapper>
              <Tableau title={'Mint'} imgSrc={CLQDR_ICON} />

              <InputWrapper>
                <InputBox currency={inputCurrency} value={amount} onChange={setAmount} />
                <ArrowBox>
                  <ArrowBubble size={24} />
                </ArrowBox>
                <InputBox
                  currency={outputCurrency}
                  value={formattedAmountOut == '0' ? '' : formattedAmountOut}
                  onChange={() => console.log('')}
                  disabled
                />
                {firebird && firebird.cLqdrAmountOut && amount && buyOnFirebird && (
                  <BuyClqdrInputBox
                    currency={outputCurrency}
                    value={formatBalance(firebird.cLqdrAmountOut, 7)}
                    onChange={() => console.log('')}
                    disabled
                  />
                )}
                {getApproveButton()}
                {getActionButton()}
              </InputWrapper>
            </Wrapper>
          </RightWrapper>
        </ContentWrapper>
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
