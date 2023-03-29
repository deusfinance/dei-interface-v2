import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'

import { IconWrapper, Swap as SwapIcon } from 'components/Icons'
import {
  LQDR_TOKEN,
  cLQDR_TOKEN,
  DEUS_TOKEN,
  DEI_TOKEN,
  BDEI_TOKEN,
  XDEUS_TOKEN,
  LegacyDEI_TOKEN,
  USDC_TOKEN,
  WFTM_TOKEN,
  Tokens,
} from 'constants/tokens'
import { CLQDR_ADDRESS } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'
import { formatBalance, toBN } from 'utils/numbers'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useDepositLQDRCallback } from 'hooks/useClqdrCallback'
import { useCalcSharesFromAmount } from 'hooks/useClqdrPage'

import { DotFlashing } from 'components/Icons'
import InputBox from 'components/InputBox'
import {
  BottomWrapper,
  Container,
  InputWrapper,
  Wrapper as MainWrapper,
  MainButton,
  ConnectWallet,
} from 'components/App/StableCoin'
import WarningModal from 'components/ReviewModal/Warning'
import AdvancedOptions from 'components/ReviewModal/AdvancedOptions'
import { useUserSlippageTolerance, useSetUserSlippageTolerance } from 'state/user/hooks'
import TokensModal from 'components/App/Swap/TokensModal'
import { Currency, Token } from '@sushiswap/core-sdk'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import { RowCenter } from 'components/Row'
import { ExternalLink } from 'components/Link'
import { ArrowUpRight } from 'react-feather'
import useDebounce from 'hooks/useDebounce'
import { StablePools } from 'constants/sPools'
import { useSwapAmountsOut } from 'hooks/useSwapPage'
import { useFetchFirebirdData } from 'hooks/useFirebirdPage'
import FirebirdInputBox from 'components/App/Swap/FirebirdInputBox'
import Link from 'next/link'
import { useMintPage } from 'hooks/useMintPage'
import { SupportedChainId } from 'constants/chains'
import ReviewModal from 'components/ReviewModal/ReviewModal'
import useSwapCallback from 'hooks/useSwapCallback'

const Wrapper = styled(MainWrapper)`
  margin-top: 68px;
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
const TextWrapper = styled.div`
  display: flex;
  gap: 4px;
`

const ExtLink = styled(ExternalLink)`
  width: 100%;
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
`

enum SwapType {
  MINT,
  EXTERNAL,
  STABLEPOOL,
}

interface TokenSwap {
  id: number
  token0: Token
  token1: Token
  swapType: SwapType
  link?: string
}

const tokenSwaps: TokenSwap[] = [
  {
    id: 0,
    token0: LegacyDEI_TOKEN,
    token1: BDEI_TOKEN,
    swapType: SwapType.STABLEPOOL,
  },
  {
    id: 1,
    token0: DEUS_TOKEN,
    token1: XDEUS_TOKEN,
    swapType: SwapType.STABLEPOOL,
  },
  {
    id: 2,
    token0: USDC_TOKEN,
    token1: DEI_TOKEN,
    swapType: SwapType.MINT,
    link: '/mint',
  },
  {
    id: 3,
    token0: LQDR_TOKEN,
    token1: cLQDR_TOKEN,
    swapType: SwapType.MINT,
  },
  {
    id: 4,
    token0: DEUS_TOKEN,
    token1: USDC_TOKEN,
    swapType: SwapType.EXTERNAL,
  },
  {
    id: 5,
    token0: WFTM_TOKEN,
    token1: DEUS_TOKEN,
    swapType: SwapType.EXTERNAL,
  },
  {
    id: 6,
    token0: LegacyDEI_TOKEN,
    token1: USDC_TOKEN,
    swapType: SwapType.EXTERNAL,
  },
]

const slippageInfo =
  'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.'

export default function Swap() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)
  const [isOpenTokensModal, toggleTokensModal] = useState(false)

  const [inputCurrency, setInputCurrency] = useState<Token>(DEUS_TOKEN)
  const [outputCurrency, setOutputCurrency] = useState<Token>(XDEUS_TOKEN)
  const [tokenSwap, setTokenSwap] = useState<TokenSwap>(tokenSwaps[0])
  const [field, setField] = useState('')
  const [amount, setAmount] = useState('')
  const [formattedOutputAmount, setFormattedOutputAmount] = useState('')

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMintConfirmation, setAwaitingMintConfirmation] = useState<boolean>(false)
  const [awaitingSwapConfirmation, setAwaitingSwapConfirmation] = useState<boolean>(false)

  const debouncedAmount = useDebounce(amount, 500)
  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const token1Amount = useMemo(() => {
    return tryParseAmount(amount, inputCurrency || undefined)
  }, [amount, inputCurrency])
  const token2Amount = useMemo(() => {
    return tryParseAmount(formattedOutputAmount, outputCurrency || undefined)
  }, [formattedOutputAmount, outputCurrency])

  // firebird hooks
  const firebird = useFetchFirebirdData(debouncedAmount, inputCurrency || LQDR_TOKEN, outputCurrency || cLQDR_TOKEN)
  const firebirdLink: string = useMemo(() => {
    return `https://app.firebird.finance/swap?inputCurrency=${inputCurrency.address}&outputCurrency=${outputCurrency.address}&net=250`
  }, [inputCurrency, outputCurrency])

  const buyOnFirebird = useMemo(
    () =>
      formattedOutputAmount !== '0' &&
      firebird &&
      firebird.outputTokenAmount &&
      toBN(firebird.outputTokenAmount).gt(formattedOutputAmount)
        ? true
        : false,
    [firebird, formattedOutputAmount]
  )

  // set current token swap
  useMemo(() => {
    tokenSwaps.map((tokenSwap) => {
      if (
        (tokenSwap.token0.address === inputCurrency.address && tokenSwap.token1.address === outputCurrency.address) ||
        (tokenSwap.token1.address === inputCurrency.address && tokenSwap.token0.address === outputCurrency.address)
      )
        setTokenSwap(tokenSwap)
    })
  }, [inputCurrency, outputCurrency])

  // generate input tokens from token swaps
  const inputTokens: Token[] = useMemo(() => {
    return [
      ...new Set([
        ...tokenSwaps.filter((tokenSwap) => tokenSwap.swapType != SwapType.MINT).map((tokenSwap) => tokenSwap.token0),
        ...tokenSwaps.filter((tokenSwap) => tokenSwap.swapType != SwapType.MINT).map((tokenSwap) => tokenSwap.token1),
        ...tokenSwaps.filter((tokenSwap) => tokenSwap.swapType === SwapType.MINT).map((tokenSwap) => tokenSwap.token0), // MINT swaps are not bidirectional
      ]),
    ]
  }, [])

  // generate output tokens for a given output token
  const outputTokens: Token[] = useMemo(() => {
    const tokens: Token[] = []
    tokenSwaps.map((tokenSwap) => {
      if (tokenSwap.token0.address === inputCurrency.address) tokens.push(tokenSwap.token1)
      if (tokenSwap.swapType != SwapType.MINT && tokenSwap.token1.address === inputCurrency.address)
        tokens.push(tokenSwap.token0) // can't redeem for mintable swaps
    })
    return tokens
  }, [inputCurrency])

  const getOutputTokens = (inputToken: Token): Token[] => {
    const tokens: Token[] = []
    tokenSwaps.map((tokenSwap) => {
      if (tokenSwap.token0.address === inputToken.address) tokens.push(tokenSwap.token1)
      if (tokenSwap.swapType != SwapType.MINT && tokenSwap.token1.address === inputToken.address)
        tokens.push(tokenSwap.token0) // can't redeem for mintable swaps
    })
    return tokens
  }

  //get stable pool info
  const stablePool = useMemo(() => {
    return StablePools[tokenSwap.id] || StablePools[0]
  }, [tokenSwap])

  const { amountOut: stablePoolAmountOut } = useSwapAmountsOut(
    debouncedAmount,
    inputCurrency,
    outputCurrency,
    stablePool
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

  // clqdr mint hooks
  const clqdrMintOutputAmount = useCalcSharesFromAmount(amount)
  const { state: mintCallbackState, callback: mintCallback, error: mintCallbackError } = useDepositLQDRCallback(amount)

  // dei mint hooks
  const {
    amountOut: deiMintOutputAmount,
    onUserInput1,
    onUserInput2,
    onUserOutput,
  } = useMintPage(
    Tokens.USDC[SupportedChainId.FANTOM],
    Tokens.DEUS[SupportedChainId.FANTOM],
    Tokens['DEI'][SupportedChainId.FANTOM]
  )

  // set output amount based on selected token swap
  useMemo(() => {
    if (tokenSwap.swapType === SwapType.MINT && tokenSwap.id === 2) setFormattedOutputAmount(deiMintOutputAmount)
    else if (tokenSwap.swapType === SwapType.MINT && tokenSwap.id === 3)
      !clqdrMintOutputAmount ? '' : setFormattedOutputAmount(toBN(clqdrMintOutputAmount).div(1e18).toFixed() || '')
    else if (tokenSwap.swapType === SwapType.STABLEPOOL) setFormattedOutputAmount(stablePoolAmountOut)
    else if (tokenSwap.swapType === SwapType.EXTERNAL)
      amount ? setFormattedOutputAmount(firebird?.outputTokenAmount || '') : setFormattedOutputAmount('')
  }, [tokenSwap, deiMintOutputAmount, clqdrMintOutputAmount, stablePoolAmountOut, amount, firebird])

  const spender = useMemo(
    () =>
      chainId
        ? tokenSwap.swapType === SwapType.STABLEPOOL
          ? stablePool
            ? stablePool.swapFlashLoan
            : undefined
          : CLQDR_ADDRESS[chainId]
        : undefined,
    [chainId, stablePool, tokenSwap]
  )
  const [approvalState, approveCallback] = useApproveCallback(inputCurrency ?? undefined, spender)

  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = inputCurrency && approvalState !== ApprovalState.APPROVED && !!amount
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [inputCurrency, approvalState, amount])

  const summaryText = useMemo(() => {
    return tokenSwap.swapType === SwapType.MINT
      ? `Minting ${formattedOutputAmount} ${outputCurrency.symbol} from ${amount} ${inputCurrency.symbol}`
      : `Swapping ${amount} ${inputCurrency.symbol} for ${formattedOutputAmount} ${outputCurrency.symbol}`
  }, [tokenSwap, inputCurrency, outputCurrency, amount, formattedOutputAmount])

  const insufficientBalance = useMemo(() => {
    if (!token1Amount) return false
    return inputCurrencyBalance?.lessThan(token1Amount)
  }, [inputCurrencyBalance, token1Amount])

  function setToken(currency: Currency) {
    field === 'input' ? setInputCurrency(currency as unknown as Token) : setOutputCurrency(currency as unknown as Token)
    setField('')
  }

  const handleTokenSelect = (token: Token) => {
    setToken(token)
    if (field === 'input') setOutputCurrency(getOutputTokens(token)[0])
  }

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

  function handleClick() {
    const currency = inputCurrency
    if (tokenSwap.swapType != SwapType.MINT) {
      setInputCurrency(outputCurrency)
      setOutputCurrency(currency)
    }
  }

  function handleInputChange(value: string) {
    onUserInput1(value)
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
    } else if (showApprove && tokenSwap.swapType != SwapType.EXTERNAL)
      return <MainButton onClick={() => handleApprove()}>Allow us to spend {inputCurrency?.symbol}</MainButton>
    else if (showApprove && tokenSwap.swapType === SwapType.EXTERNAL)
      return (
        <ExtLink href={firebirdLink}>
          <MainButton>
            <TextWrapper>
              Swap on firebird
              <IconWrapper style={{ marginTop: '4px' }}>
                <ArrowUpRight />
              </IconWrapper>
            </TextWrapper>
          </MainButton>
        </ExtLink>
      )

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    else if (showApprove) return null
    else if (tokenSwap.swapType === SwapType.EXTERNAL)
      return (
        <ExtLink href={firebirdLink}>
          <MainButton>
            <TextWrapper>
              Swap on firebird
              <IconWrapper>
                <ArrowUpRight />
              </IconWrapper>
            </TextWrapper>
          </MainButton>
        </ExtLink>
      )
    else if (insufficientBalance) return <MainButton disabled>Insufficient {inputCurrency?.symbol} Balance</MainButton>
    else if (awaitingMintConfirmation) {
      return (
        <MainButton>
          Minting {outputCurrency?.symbol} <DotFlashing />
        </MainButton>
      )
    }

    return (
      <Link href={tokenSwap.link || ''} passHref>
        <MainButton
          onClick={() => {
            if (amount !== '0' && amount !== '' && amount !== '0.' && tokenSwap.swapType != SwapType.EXTERNAL)
              toggleReviewModal(true)
          }}
        >
          {tokenSwap.swapType === SwapType.STABLEPOOL ? 'Swap' : firebird && buyOnFirebird ? 'Mint anyway' : 'Mint'}
        </MainButton>
      </Link>
    )
  }

  useWeb3NavbarOption({ reward: true, wallet: true, network: true })

  return (
    <>
      <Container>
        <Wrapper>
          <TableauContainer>Swap</TableauContainer>
          <InputContainer>
            <InputWrapper>
              <InputBox
                currency={inputCurrency}
                value={amount}
                onChange={handleInputChange}
                onTokenSelect={() => {
                  toggleTokensModal(true)
                  setField('input')
                }}
              />

              <SwapWrapper onClick={handleClick}>
                <SwapIcon />
              </SwapWrapper>

              <InputBox
                currency={outputCurrency}
                value={formattedOutputAmount}
                onChange={(value: string) => onUserOutput(value)}
                onTokenSelect={() => {
                  toggleTokensModal(true)
                  setField('output')
                }}
              />

              <ActionButtonWrapper>
                {tokenSwap.swapType === SwapType.MINT && firebird && buyOnFirebird && (
                  <FirebirdInputBox
                    currency={outputCurrency}
                    firebirdLink={firebirdLink}
                    value={formatBalance(firebird.outputTokenAmount, 7)}
                    onChange={() => console.log('')}
                    disabled
                  />
                )}

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
      </Container>

      <TokensModal
        isOpen={isOpenTokensModal}
        tokens={field === 'input' ? inputTokens : outputTokens}
        toggleModal={(action: boolean) => toggleTokensModal(action)}
        selectedTokenIndex={field === 'input' ? inputCurrency : outputCurrency}
        setToken={(currency) => handleTokenSelect(currency as Token)}
      />

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', summaryText]}
      />

      <ReviewModal
        title={tokenSwap.swapType === SwapType.MINT ? 'Review Mint Transaction' : 'Review Swap Transaction'}
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[inputCurrency]}
        outputTokens={[outputCurrency]}
        amountsIn={[amount]}
        amountsOut={[formattedOutputAmount]}
        info={[]}
        data={''}
        buttonText={tokenSwap.swapType === SwapType.MINT ? 'Confirm Mint' : 'Confirm Swap'}
        awaiting={tokenSwap.swapType === SwapType.MINT ? awaitingMintConfirmation : awaitingSwapConfirmation}
        summary={summaryText}
        handleClick={tokenSwap.swapType === SwapType.MINT ? handleMint : handleSwap}
      />
    </>
  )
}
