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
} from 'constants/tokens'
import { CLQDR_ADDRESS } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'
import { formatBalance, toBN } from 'utils/numbers'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useDepositLQDRCallback } from 'hooks/useClqdrCallback'
import { useCalcSharesFromAmount, useClqdrData } from 'hooks/useClqdrPage'

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
import Tableau from 'components/App/StableCoin/Tableau'
import WarningModal from 'components/ReviewModal/Warning'
import AdvancedOptions from 'components/ReviewModal/AdvancedOptions'
import { useUserSlippageTolerance, useSetUserSlippageTolerance } from 'state/user/hooks'
import TokensModal from 'components/App/Swap/TokensModal'
import { Currency, Token } from '@sushiswap/core-sdk'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import { RowCenter } from 'components/Row'
import { ExternalLink } from 'components/Link'
import { ArrowUpRight, X } from 'react-feather'
import useDebounce from 'hooks/useDebounce'
import { StablePools } from 'constants/sPools'
import { useSwapAmountsOut } from 'hooks/useSwapPage'
import { useFetchFirebirdData } from 'hooks/useFirebirdPage'
import FirebirdInputBox from 'components/App/Swap/FirebirdInputBox'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'
import Link from 'next/link'

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
const TextWrapper = styled.div`
  display: flex;
  gap: 4px;
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
    token0: LegacyDEI_TOKEN,
    token1: USDC_TOKEN,
    swapType: SwapType.EXTERNAL,
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
    token0: USDC_TOKEN,
    token1: DEI_TOKEN,
    swapType: SwapType.MINT,
    link: '/mint',
  },
]

export default function Swap() {
  const { chainId, account } = useWeb3React()
  const isSupportedChainId = useSupportedChainId()

  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)
  const [isOpenTokensModal, toggleTokensModal] = useState(false)

  // const [currentField, setCurrentField] = useState<Field>(Field.INPUT)
  // const currentFieldSide = useMemo(() => (currentField === Field.INPUT ? Field.OUTPUT : Field.INPUT), [currentField])
  // const { allowedSlippage, parsedAmount, currencies, trade, inputError: swapInputError } = useDerivedSwapInfo()

  const [inputCurrency, setInputCurrency] = useState<Token>(DEUS_TOKEN)
  const [outputCurrency, setOutputCurrency] = useState<Token>(XDEUS_TOKEN)
  const [tokenSwap, setTokenSwap] = useState<TokenSwap>(tokenSwaps[0])
  const [field, setField] = useState('')
  const [formattedOutputAmount, setFormattedOutputAmount] = useState('')

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, inputCurrency)

  const [amount, setAmount] = useState('')
  const debouncedAmount = useDebounce(amount, 500)
  const amountOutBN = useCalcSharesFromAmount(amount)

  const firebirdLink: string = useMemo(() => {
    return `https://app.firebird.finance/swap?inputCurrency=${inputCurrency.address}&outputCurrency=${outputCurrency.address}&net=250`
  }, [inputCurrency, outputCurrency])

  const inputTokens: Token[] = useMemo(() => {
    return [
      ...new Set([
        ...tokenSwaps.filter((x) => x.swapType != SwapType.MINT).map((x) => x.token0),
        ...tokenSwaps.filter((x) => x.swapType != SwapType.MINT).map((x) => x.token1),
        ...tokenSwaps.filter((x) => x.swapType === SwapType.MINT).map((x) => x.token0), // MINT swaps are not bidirectional
      ]),
    ]
  }, [])

  const outputTokens: Token[] = useMemo(() => {
    const tokens: Token[] = []
    tokenSwaps.map((x) => {
      if (x.token0.address === inputCurrency.address) tokens.push(x.token1)
      if (x.swapType != SwapType.MINT && x.token1.address === inputCurrency.address) tokens.push(x.token0) // can't redeem for mintable swaps
    })
    return tokens
  }, [inputCurrency])

  const getOutputTokens = (inputToken: Token): Token[] => {
    const tokens: Token[] = []
    tokenSwaps.map((x) => {
      if (x.token0.address === inputToken.address) tokens.push(x.token1)
      if (x.swapType != SwapType.MINT && x.token1.address === inputToken.address) tokens.push(x.token0) // can't redeem for mintable swaps
    })
    return tokens
  }

  useMemo(() => {
    tokenSwaps.map((x) => {
      if (
        (x.token0.address === inputCurrency.address && x.token1.address === outputCurrency.address) ||
        (x.token1.address === inputCurrency.address && x.token0.address === outputCurrency.address)
      )
        setTokenSwap(x)
    })
  }, [inputCurrency, outputCurrency])

  //get stable pool info
  const stablePool = useMemo(() => {
    return StablePools[tokenSwap.id] || StablePools[0]
  }, [tokenSwap])

  //todo fix me in dei bond
  const { amountOut: stablePoolAmountOut } = useSwapAmountsOut(
    debouncedAmount,
    inputCurrency,
    outputCurrency,
    stablePool
  )

  const formattedAmountOut = amountOutBN == '' ? '0' : toBN(amountOutBN).div(1e18).toFixed()

  const firebird = useFetchFirebirdData(debouncedAmount, inputCurrency || LQDR_TOKEN, outputCurrency || cLQDR_TOKEN)

  const { mintRate: cLqdrMintRate } = useClqdrData()

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

  useMemo(() => {
    if (tokenSwap.swapType === SwapType.MINT)
      setFormattedOutputAmount(formattedAmountOut == '0' ? '' : formattedAmountOut)
    else if (tokenSwap.swapType === SwapType.STABLEPOOL) setFormattedOutputAmount(stablePoolAmountOut)
    else if (tokenSwap.swapType === SwapType.EXTERNAL)
      amount ? setFormattedOutputAmount(firebird?.outputTokenAmount || '') : setFormattedOutputAmount('')
  }, [firebird, formattedAmountOut, stablePoolAmountOut, tokenSwap, amount])

  const handleTokenSelect = (token: Token) => {
    setToken(token)
    if (field === 'input') setOutputCurrency(getOutputTokens(token)[0])
  }

  const buyOnFirebird = useMemo(
    () =>
      formattedAmountOut !== '0' && firebird && firebird.convertRate && toBN(firebird.convertRate).lt(cLqdrMintRate)
        ? true
        : false,
    [firebird, formattedAmountOut, cLqdrMintRate]
  )

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
    } else if (showApprove && tokenSwap.swapType != SwapType.EXTERNAL)
      return <MainButton onClick={() => handleApprove()}>Allow us to spend {inputCurrency?.symbol}</MainButton>
    else if (showApprove && tokenSwap.swapType === SwapType.EXTERNAL)
      return (
        <MainButton>
          <ExternalLink href={firebirdLink}>
            <TextWrapper>
              Swap on firebird
              <IconWrapper>
                <ArrowUpRight />
              </IconWrapper>
            </TextWrapper>
          </ExternalLink>
        </MainButton>
      )

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
      <Link href={tokenSwap.link || ''} passHref>
        <MainButton
          onClick={() => {
            if (amount !== '0' && amount !== '' && amount !== '0.' && tokenSwap.swapType != SwapType.EXTERNAL)
              toggleReviewModal(true)
          }}
        >
          {tokenSwap.swapType === SwapType.EXTERNAL ? (
            <ExternalLink href={firebirdLink}>
              <TextWrapper>
                Swap on firebird
                <IconWrapper>
                  <ArrowUpRight />
                </IconWrapper>
              </TextWrapper>
            </ExternalLink>
          ) : tokenSwap.swapType === SwapType.STABLEPOOL ? (
            'Swap'
          ) : (
            'Mint'
          )}
        </MainButton>
      </Link>
    )
  }

  const slippageInfo =
    'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.'

  function setToken(currency: Currency) {
    field === 'input' ? setInputCurrency(currency as unknown as Token) : setOutputCurrency(currency as unknown as Token)
    setField('')
  }

  function handleClick() {
    const currency = inputCurrency
    if (tokenSwap.swapType != SwapType.MINT) {
      setInputCurrency(outputCurrency)
      setOutputCurrency(currency)
    }
  }
  useWeb3NavbarOption({ reward: true, wallet: true, network: true })

  return (
    <>
      <Container>
        <Wrapper>
          <TableauContainer>
            <Tableau title={'Swap'} />
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
                value={formattedOutputAmount}
                onChange={() => console.log('')}
                onTokenSelect={() => {
                  toggleTokensModal(true)
                  setField('output')
                }}
              />
              {tokenSwap.swapType === SwapType.MINT &&
                firebird &&
                firebird.outputTokenAmount &&
                amount &&
                buyOnFirebird && (
                  <FirebirdInputBox
                    currency={outputCurrency}
                    firebirdLink={firebirdLink}
                    value={formatBalance(firebird.outputTokenAmount, 7)}
                    onChange={() => console.log('')}
                    disabled
                  />
                )}
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
        tokens={field === 'input' ? inputTokens : outputTokens}
        toggleModal={(action: boolean) => toggleTokensModal(action)}
        selectedTokenIndex={field === 'input' ? inputCurrency : outputCurrency}
        setToken={(currency) => handleTokenSelect(currency as Token)}
      />

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', `Minting ${amount} cLQDR by ${amount} LQDR`]}
      />

      <DefaultReviewModal
        title={tokenSwap.swapType === SwapType.MINT ? 'Review Mint Transaction' : 'Review Swap Transaction'}
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[inputCurrency]}
        outputTokens={[outputCurrency]}
        amountsIn={[amount]}
        amountsOut={[formattedAmountOut]}
        info={[]}
        data={''}
        buttonText={tokenSwap.swapType === SwapType.MINT ? 'Confirm Mint' : 'Confirm Swap'}
        awaiting={awaitingMintConfirmation}
        summary={
          tokenSwap.swapType === SwapType.MINT
            ? `Minting ${formattedAmountOut} ${outputCurrency.symbol} by ${amount} ${inputCurrency.symbol}`
            : `Swapping ${amount} ${inputCurrency.symbol} for ${formattedAmountOut} ${outputCurrency.symbol}`
        }
        handleClick={handleMint}
      />
    </>
  )
}
