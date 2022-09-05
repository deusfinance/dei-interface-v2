import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown as ArrowDownIcon } from 'react-feather'
import Image from 'next/image'

import BRIDGE_LOGO from '/public/static/images/pages/bridge/ic_bridge.svg'
import MUON_LOGO from '/public/static/images/pages/bridge/muon_logo.svg'
import DEI_BACKGROUND from '/public/static/images/pages/bridge/ic_bridge_dei.svg'
import DEUS_BACKGROUND from '/public/static/images/pages/bridge/ic_bridge_deus.svg'

import { DEI_TOKEN, DEUS_TOKEN, Tokens } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { tryParseAmount } from 'utils/parse'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useRedeemPaused, useExpiredPrice, useCollateralCollectionDelay, useDeusCollectionDelay } from 'state/dei/hooks'
import useWeb3React from 'hooks/useWeb3'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useGetCollateralRatios, useRedeemAmountOut } from 'hooks/useRedemptionPage'
import useUpdateCallback from 'hooks/useOracleCallback'

import Hero from 'components/Hero'
import { Row, RowCenter } from 'components/Row'
import InputBox from 'components/App/Bridge/InputBox'
import DefaultReviewModal from 'components/App/Bridge/TransactionReviewModal'
import { Container, InputWrapper, Wrapper, MainButton, ConnectWallet, GradientButton } from 'components/App/StableCoin'
import Tableau from 'components/App/StableCoin/Tableau'
import Claim from 'components/App/Bridge/Claim'
import usePoolStats from 'components/App/StableCoin/PoolStats'
import TokensBox from 'components/App/Bridge/TokensBox'
import { Token } from '@sushiswap/core-sdk'
import { Info } from 'components/Icons'
import { BRIDGE__TOKENS } from 'constants/inputs'
import ChainsModal from 'components/App/Bridge/ChainsModal'

const MainWrap = styled(RowCenter)`
  align-items: flex-start;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-direction: column-reverse;
    & > * {
      margin: 10px auto;
    }
  `}
`

const BridgeWrapper = styled(InputWrapper)`
  & > * {
    &:nth-child(2) {
      margin: 15px;
    }
    &:nth-child(4) {
      margin: 15px auto;
    }
  }
`

const BottomWrap = styled(Row)`
  width: 100%;
  height: 48px;
  font-size: 12px;
  align-items: center;
  padding: 0px 20px;
  color: ${({ theme }) => theme.text2};
  background: ${({ theme }) => theme.bg1};
`

const BridgeInfo = styled.div`
  margin-left: 6px;
  margin-bottom: 1px;
`

const MuonWrap = styled(RowCenter)`
  margin-top: 30px;
  height: 20px;
`

const MuonText = styled.div`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 16px;
  background: linear-gradient(90deg, #4f49f6 0%, #9849c1 60.42%, #e6975e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 5px;
`

const Separator = styled.div`
  width: 510px;
  /* margin-left: -13px; */
  height: 1px;
  background: ${({ theme }) => theme.bg4};
`

const ArrowDown = styled(ArrowDownIcon)`
  cursor: pointer;
  border-radius: 30px;
  &:hover {
    background: ${({ theme }) => theme.bg3};
    transform: rotate(180deg);
  }
`

export default function Bridge() {
  const { chainId, account } = useWeb3React()
  const [amountIn, setAmountIn] = useState('')
  const redeemPaused = useRedeemPaused()

  const [sourceChainId, setSourceChainId] = useState<SupportedChainId | null | undefined>(chainId)
  const [destinationChainId, setDestinationChainId] = useState<SupportedChainId | null>(null)
  const [selectedChain, setSelectedChain] = useState<SupportedChainId | null>(null)
  // const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenChainsModal, toggleChainsModal] = useState(false)
  const [selectedTokenInputBox, setSelectedTokenInputBox] = useState<string | null>(null)
  const [amountOut, setAmountOut] = useState('')

  const [tokenSymbol, setTokenSymbol] = useState<string>('DEI')
  const [tokenIn, setTokenIn] = useState<Token>(DEUS_TOKEN)
  const [tokenOut, setTokenOut] = useState<Token>(DEUS_TOKEN)

  const expiredPrice = useExpiredPrice()

  const { collateralAmount, deusValue } = useRedeemAmountOut(amountIn)

  // Define dropdown options
  const [inputTokenOption, inputChainOptions, outputChainOptions] = useMemo(() => {
    // const DEFAULT_OPTIONS = [[], [], []]
    const tokens = Object.keys(BRIDGE__TOKENS).map((symbol) => {
      const token = BRIDGE__TOKENS[symbol]
      return {
        symbol,
        // logo: Tokens[symbol][token.sourceChains[0]].logo,
      }
    })

    const inputChains = BRIDGE__TOKENS[tokens[0].symbol].sourceChains.sort()
    const outputChains = BRIDGE__TOKENS[tokens[0].symbol].destinationChains.sort()
    return [tokens, inputChains, outputChains]
  }, [])

  useEffect(() => {
    if (tokenSymbol != '' && chainId && sourceChainId) {
      const pickSourceChainId = inputChainOptions.includes(sourceChainId) ? sourceChainId : inputChainOptions[0]
      const filterDestinationOptions = outputChainOptions.filter((chainId) => chainId != pickSourceChainId)
      const pickDestinationChainId = destinationChainId
        ? filterDestinationOptions.includes(destinationChainId)
          ? destinationChainId
          : filterDestinationOptions[0]
        : filterDestinationOptions[0]

      setSourceChainId(pickSourceChainId)
      setDestinationChainId(pickDestinationChainId)

      setTokenIn(Tokens[tokenSymbol ?? 'DEI'][pickSourceChainId])
      setTokenOut(Tokens[tokenSymbol ?? 'DEI'][destinationChainId ?? pickDestinationChainId])
    }
  }, [tokenSymbol, inputChainOptions, outputChainOptions, sourceChainId, destinationChainId, chainId])

  useEffect(() => {
    setAmountOut(collateralAmount)
  }, [collateralAmount, deusValue])

  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])

  const { callback: updateOracleCallback } = useUpdateCallback()

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(deiAmount)

  const { mintCollateralRatio, redeemCollateralRatio } = useGetCollateralRatios()

  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState(false)

  useEffect(() => {
    if (!isOpenChainsModal) setSelectedTokenInputBox(null)
  }, [isOpenChainsModal])

  const handleUpdatePrice = useCallback(async () => {
    if (!updateOracleCallback) return
    try {
      setAwaitingUpdateConfirmation(true)
      const txHash = await updateOracleCallback()
      console.log({ txHash })
      // toggleUpdateOracleModal(false)
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

  const handleRedeem = useCallback(async () => {
    console.log('called handleRedeem')
    console.log(redeemCallbackState, redeemCallbackError)
    if (!redeemCallback) return
    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await redeemCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
      toggleReviewModal(false)
      setAmountIn('')
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [redeemCallbackState, redeemCallback, redeemCallbackError])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <ConnectWallet />
    } else if (redeemPaused) {
      return <MainButton disabled>Redeem Paused</MainButton>
    } else if (awaitingUpdateConfirmation) {
      return <GradientButton title={'Updating Oracle'} awaiting />
    } else if (expiredPrice) {
      return <GradientButton onClick={handleUpdatePrice} title={'Update Oracle'} />
    } else if (insufficientBalance) {
      return <MainButton disabled>Insufficient {deiCurrency?.symbol} Balance</MainButton>
    }
    return (
      <MainButton
        onClick={() => {
          if (amountIn && amountIn !== '0' && amountIn !== '' && amountIn !== '0.') toggleReviewModal(true)
        }}
      >
        Redeem DEI
      </MainButton>
    )
  }
  const items = usePoolStats()

  const collateralCollectionDelay = useCollateralCollectionDelay()
  const deusCollectionDelay = useDeusCollectionDelay()

  const info = useMemo(() => {
    return [
      {
        title: 'Max Slippage',
        value: '0.1%',
      },
      { title: 'Txn Deadline', value: '20 min' },
      { title: 'Network Fee', value: '0.001 FTM' },
    ]
  }, [collateralCollectionDelay, deusCollectionDelay])

  function onTokenSelect(source: string) {
    if (source === 'tokenIn') setSelectedChain(tokenIn.chainId)
    else if (source === 'tokenOut') setSelectedChain(tokenOut.chainId)
    toggleChainsModal(true)
    setSelectedTokenInputBox(source)
  }

  function chainModalHandleClick(chainId: SupportedChainId) {
    if (selectedTokenInputBox === 'tokenIn') setSourceChainId(chainId)
    else if (selectedTokenInputBox === 'tokenOut') setDestinationChainId(chainId)

    setSelectedTokenInputBox(null)
    setSelectedChain(null)
    toggleChainsModal(false)
  }

  return (
    <>
      <Container>
        <Hero>
          <Image src={BRIDGE_LOGO} height={'90px'} alt="Logo" />
          <MuonWrap>
            <MuonText>Secured by Muon</MuonText>
            <Image src={MUON_LOGO} height={'90px'} alt="Logo" />
          </MuonWrap>
        </Hero>
        <MainWrap>
          <Wrapper>
            <Tableau title={'Bridge'} imgSrc={tokenIn.name === 'DEI' ? DEI_BACKGROUND : DEUS_BACKGROUND} />

            <BridgeWrapper>
              <TokensBox
                title={'Select token to bridge'}
                tokens={[DEUS_TOKEN, DEI_TOKEN]}
                selectedToken={tokenIn}
                onTokenSelect={(token: Token) => {
                  setTokenSymbol(token.name ?? 'DEI')
                }}
              />
              <Separator />
              <InputBox
                currency={tokenIn}
                value={amountIn}
                onChange={(value: string) => setAmountIn(value)}
                disabled={expiredPrice}
                onTokenSelect={() => onTokenSelect('tokenIn')}
              />
              <ArrowDown
                onClick={() => {
                  const token = tokenIn
                  const tokenInChainId = sourceChainId
                  setTokenIn(tokenOut)
                  setSourceChainId(destinationChainId)
                  setTokenOut(token)
                  setDestinationChainId(tokenInChainId ?? null)
                }}
              />

              <InputBox
                currency={tokenOut}
                value={amountOut}
                onChange={(value: string) => console.log(value)}
                disabled={true}
                onTokenSelect={() => onTokenSelect('tokenOut')}
              />
              <div style={{ marginTop: '20px' }}></div>
              {getActionButton()}
            </BridgeWrapper>
            <BottomWrap>
              <Info size={16} />
              <BridgeInfo>{'Approve > Deposit > Switch Network > Claim Token'}</BridgeInfo>
            </BottomWrap>
          </Wrapper>
          <Claim redeemCollateralRatio={redeemCollateralRatio} handleUpdatePrice={handleUpdatePrice} />
        </MainWrap>
      </Container>

      <ChainsModal
        title="Select Chain"
        chains={inputChainOptions}
        isOpen={isOpenChainsModal}
        selectedChain={selectedChain}
        toggleModal={(action: boolean) => toggleChainsModal(action)}
        handleClick={chainModalHandleClick}
      />

      <DefaultReviewModal
        title="Review Bridge Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[tokenIn]}
        outputTokens={[tokenOut]}
        amountsIn={[amountIn]}
        amountsOut={[amountOut]}
        info={info}
        data={''}
        buttonText={'Confirm Bridge'}
        awaiting={awaitingRedeemConfirmation}
        summary={`Bridging ${amountIn} DEI to ${amountOut} USDC and DEUS`}
        handleClick={handleRedeem}
      />
    </>
  )
}
