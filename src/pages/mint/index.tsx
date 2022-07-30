import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { tryParseAmount } from 'utils/parse'
import { CollateralPool } from 'constants/addresses'
import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'
import DEI_LOGO from '/public/static/images/pages/mint/DEI_Logo.svg'

import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import InputBox from 'components/App/mint/InputBox'
import { RowBetween } from 'components/Row'
import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import StatsHeader from 'components/StatsHeader'
import { BottomWrapper, Container, InputWrapper, Title, Wrapper, MainButton } from 'components/App/StableCoin'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import TokensModal from 'components/App/StableCoin/TokensModal'
import { MINT__INPUTS, MINT__OUTPUTS } from 'constants/inputs'
import { SupportedChainId } from 'constants/chains'
import useMintCallback from 'hooks/useMintCallback'
import useMintAmountOut from 'hooks/useMintPage'
import { DEUS_TOKEN } from 'constants/tokens'
import { useCollateralRatio } from 'state/dei/hooks'
import { toBN } from 'utils/numbers'

const SlippageWrapper = styled(RowBetween)`
  margin-top: 10px;
`

const PlusIcon = styled(Plus)`
  margin: -14px auto;
  margin-left: 67px;
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
      margin: -12px auto -12px 67px;
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

export default function Mint() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()

  // FIXME: set correct fee
  const [mintingFee, setMintingFee] = useState(0.5)

  // FIXME: set correct deiPrices
  const [deiPrices, setDeiPrices] = useState({ collateral_price: '1', deus_price: '40' })

  const [amountIn1, setAmountIn1] = useState('')
  const [amountIn2, setAmountIn2] = useState('')
  const [hasPair, setHasPair] = useState(false)
  const debouncedAmountIn1 = useDebounce(amountIn1, 500)
  const debouncedAmountIn2 = useDebounce(amountIn2, 500)
  const [isOpenTokensModal, toggleTokensModal] = useState(false)
  const [inputTokenIndex, setInputTokenIndex] = useState<number>(0)

  const collateralRatio = useCollateralRatio()
  // const collateralRatioBN = toBN(collateralRatio)
  // const oneHundred = toBN(100)

  const tokens = useMemo(() => MINT__INPUTS[chainId ?? SupportedChainId.FANTOM], [chainId])
  const outputToken = useMemo(() => MINT__OUTPUTS[chainId ?? SupportedChainId.FANTOM], [chainId])[0]

  const token1Currency = tokens[inputTokenIndex][0]
  const token2Currency = hasPair ? tokens[inputTokenIndex][1] : DEUS_TOKEN

  const OutputTokenCurrency = outputToken[0]

  const token1CurrencyBalance = useCurrencyBalance(account ?? undefined, token1Currency)
  const token2CurrencyBalance = useCurrencyBalance(account ?? undefined, token2Currency)

  const [slippage, setSlippage] = useState(0.5)

  useEffect(() => {
    if (tokens[inputTokenIndex].length > 1) {
      setAmountIn2('')
      setHasPair(true)
    } else {
      setAmountIn2('')
      setHasPair(false)
    }
  }, [inputTokenIndex, tokens])

  const [focusType, setFocusType] = useState('from1')

  useEffect(() => {
    if (amountIn1 === '' && focusType === 'from1') {
      setAmountIn2('')
    } else if (amountIn2 === '' && focusType === 'from2') {
      setAmountIn1('')
    }
  }, [amountIn1, amountIn2, focusType])

  useEffect(() => {
    if (deiPrices && hasPair) {
      const { collateral_price, deus_price } = deiPrices

      const in1Unit = collateralRatio === 0 ? deus_price : collateral_price
      const in2Unit = deus_price
      let a1 = ''
      let a2 = ''

      if (focusType === 'from1' && amountIn1 !== '') {
        a1 = amountIn1
        a2 =
          collateralRatio > 0 && collateralRatio < 100
            ? toBN(a1)
                .times(in1Unit)
                .times(100 - collateralRatio)
                .div(collateralRatio)
                .div(in2Unit)
                .toString()
            : '0'
      } else if (focusType === 'from2' && amountIn2 !== '') {
        a2 = amountIn2
        a1 = toBN(a2)
          .times(in2Unit)
          .times(collateralRatio)
          .div(100 - collateralRatio)
          .div(in1Unit)
          .toString()
      }
      setAmountIn1(a1)
      setAmountIn2(a2)
    }
  }, [debouncedAmountIn1, amountIn2, focusType, amountIn1, debouncedAmountIn2, deiPrices, hasPair, collateralRatio])

  const amountOut = useMintAmountOut(token1Currency, token2Currency, debouncedAmountIn1, debouncedAmountIn2, mintingFee)

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

  const {
    state: mintCallbackState,
    callback: mintCallback,
    error: mintCallbackError,
  } = useMintCallback(
    token1Currency,
    token2Currency,
    OutputTokenCurrency,
    debouncedAmountIn1,
    debouncedAmountIn2,
    amountOut
  )

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMintConfirmation, setAwaitingMintConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? CollateralPool[chainId] : undefined), [chainId])
  const [approvalState1, approveCallback1] = useApproveCallback(token1Currency ?? undefined, spender)
  const [approvalState2, approveCallback2] = useApproveCallback(token2Currency ?? undefined, spender)

  const [showApprove1, showApproveLoader1] = useMemo(() => {
    const show = token1Currency && approvalState1 !== ApprovalState.APPROVED && !!amountIn1
    return [show, show && approvalState1 === ApprovalState.PENDING]
  }, [token1Currency, approvalState1, amountIn1])

  const [showApprove2, showApproveLoader2] = useMemo(() => {
    if (hasPair) [false, false]
    const show = token2Currency && approvalState2 !== ApprovalState.APPROVED && !!amountIn2
    return [show, show && approvalState2 === ApprovalState.PENDING]
  }, [hasPair, token2Currency, approvalState2, amountIn2])

  const handleApprove1 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback1()
    setAwaitingApproveConfirmation(false)
  }

  const handleApprove2 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback2()
    setAwaitingApproveConfirmation(false)
  }

  const handleMint = useCallback(async () => {
    console.log('called handleMint')
    console.log(mintCallbackState, mintCallback, mintCallbackError)
    if (!mintCallback) return

    try {
      setAwaitingMintConfirmation(true)
      const txHash = await mintCallback()
      setAwaitingMintConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingMintConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [mintCallback, mintCallbackError, mintCallbackState])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) return null
    else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    } else if (showApproveLoader1 || showApproveLoader2) {
      return (
        <MainButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    } else if (showApprove1)
      return <MainButton onClick={handleApprove1}>Allow us to spend {token1Currency?.symbol}</MainButton>
    else if (showApprove2)
      return <MainButton onClick={handleApprove2}>Allow us to spend {token2Currency?.symbol}</MainButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    else if (showApprove1 || showApprove2) return null
    else if (insufficientBalance1)
      return <MainButton disabled>Insufficient {token1Currency?.symbol} Balance</MainButton>
    else if (insufficientBalance2)
      return <MainButton disabled>Insufficient {token2Currency?.symbol} Balance</MainButton>
    else if (awaitingMintConfirmation) {
      return (
        <MainButton>
          Minting {OutputTokenCurrency?.symbol} <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleMint()}>Mint {OutputTokenCurrency?.symbol}</MainButton>
  }

  // TODO: move items to use memo
  const items = [
    { name: 'DEI Price', value: '$0.5?' },
    { name: 'Collateral Ratio', value: '99.00%?' },
    { name: 'Available to Mint', value: '72.53m?' },
    { name: 'Pool Balance', value: '24.64m?' },
    { name: 'Ceiling', value: '18.88m?' },
  ]
  return (
    <Container>
      <Hero>
        <Image src={DEI_LOGO} height={'90px'} alt="Logo" />
        <Title>Mint</Title>
        <StatsHeader items={items} />
      </Hero>

      <Wrapper>
        <Tableau title={'Mint DEI'} imgSrc={MINT_IMG} />

        <InputWrapper>
          {tokens[inputTokenIndex].length > 1 ? (
            <ComboInputBox>
              <InputBox
                currency={token1Currency}
                value={amountIn1}
                onChange={(value: string) => setAmountIn1(value)}
                setFocusType={setFocusType}
                focusType="from1"
                onTokenSelect={() => {
                  toggleTokensModal(true)
                  setInputTokenIndex(inputTokenIndex)
                }}
              />
              <PlusIcon size={'24px'} />
              <InputBox
                currency={token2Currency}
                value={amountIn2}
                onChange={(value: string) => setAmountIn2(value)}
                setFocusType={setFocusType}
                focusType="from2"
                onTokenSelect={() => {
                  toggleTokensModal(true)
                  setInputTokenIndex(inputTokenIndex)
                }}
              />
            </ComboInputBox>
          ) : (
            <InputBox
              currency={token1Currency}
              value={amountIn1}
              onChange={(value: string) => setAmountIn1(value)}
              setFocusType={setFocusType}
              focusType="from1"
              onTokenSelect={() => {
                toggleTokensModal(true)
                setInputTokenIndex(inputTokenIndex)
              }}
            />
          )}

          <ArrowDown />
          <InputBox
            currency={OutputTokenCurrency}
            value={amountOut}
            onChange={(value: string) => console.log(value)}
            setFocusType={setFocusType}
            focusType="to"
            disabled={true}
          />
          <div style={{ marginTop: '30px' }}></div>
          {getApproveButton()}
          {getActionButton()}
        </InputWrapper>
        <BottomWrapper>
          <SlippageWrapper>
            <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
          </SlippageWrapper>
          <InfoItem name={'Minter Contract'} value={'Proxy'} />
          <InfoItem name={'Minting Fee'} value={'Zero'} />
        </BottomWrapper>
      </Wrapper>
      <TokensModal
        isOpen={isOpenTokensModal}
        toggleModal={(action: boolean) => toggleTokensModal(action)}
        selectedTokenIndex={inputTokenIndex}
        setToken={setInputTokenIndex}
      />
    </Container>
  )
}
