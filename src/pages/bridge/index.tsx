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
import useWeb3React from 'hooks/useWeb3'
import useDepositCallback from 'hooks/useBridgeCallback'
// import { useRedeemAmountOut } from 'hooks/useRedemptionPage'
import { ChainInfo } from 'constants/chainInfo'

import Hero from 'components/Hero'
import { Row, RowCenter } from 'components/Row'
import InputBox from 'components/App/Bridge/InputBox'
import DefaultReviewModal from 'components/App/Bridge/TransactionReviewModal'
import { Container, InputWrapper, Wrapper, MainButton, ConnectWallet } from 'components/App/StableCoin'
import Tableau from 'components/App/StableCoin/Tableau'
import Claim from 'components/App/Bridge/Claim'
// import usePoolStats from 'components/App/StableCoin/PoolStats'
import TokensBox from 'components/App/Bridge/TokensBox'
import { Token } from '@sushiswap/core-sdk'
import { DotFlashing, Info } from 'components/Icons'
import { BRIDGE__TOKENS } from 'constants/inputs'
import ChainsModal from 'components/App/Bridge/ChainsModal'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { BRIDGE_ADDRESS } from 'constants/addresses'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
// import { BridgeClient } from 'lib/muon'
// import { BRIDGE_ADDRESS } from 'constants/addresses'

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
  const bridgePaused = false // useRedeemPaused()
  const isSupportedChainId = useSupportedChainId()

  const [sourceChainId, setSourceChainId] = useState<SupportedChainId | null | undefined>(chainId)
  const [destinationChainId, setDestinationChainId] = useState<SupportedChainId | null>(null)
  const [selectedChain, setSelectedChain] = useState<SupportedChainId | null>(null)
  // const debouncedAmountIn = useDebounce(amountIn, 500)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenChainsModal, toggleChainsModal] = useState(false)
  const [selectedTokenInputBox, setSelectedTokenInputBox] = useState<string | null>(null)
  // const [amountOut, setAmountOut] = useState('')

  const [tokenSymbol, setTokenSymbol] = useState<string>('DEI')
  const [tokenIn, setTokenIn] = useState<Token>(DEUS_TOKEN)
  const [tokenOut, setTokenOut] = useState<Token>(DEUS_TOKEN)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState(false)

  const inputCurrencyBalance = useCurrencyBalance(account ?? undefined, tokenIn)

  const spender = useMemo(() => (chainId ? BRIDGE_ADDRESS[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(tokenIn ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = tokenIn && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [tokenIn, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  // Define dropdown options
  const [inputChainOptions, outputChainOptions] = useMemo(() => {
    const inputChains = BRIDGE__TOKENS[tokenSymbol].sourceChains.sort()
    const outputChains = BRIDGE__TOKENS[tokenSymbol].destinationChains.sort()
    return [inputChains, outputChains]
  }, [tokenSymbol])

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

  const inputAmount = useMemo(() => {
    return tryParseAmount(amountIn, tokenIn || undefined)
  }, [amountIn, tokenIn])

  const insufficientBalance = useMemo(() => {
    if (!inputAmount) return false
    return inputCurrencyBalance?.lessThan(inputAmount)
  }, [inputCurrencyBalance, inputAmount])

  const {
    state: depositCallbackState,
    callback: depositCallback,
    error: depositCallbackError,
  } = useDepositCallback(inputAmount, tokenOut)

  const [awaitingDepositConfirmation, setAwaitingBridgeConfirmation] = useState(false)

  useEffect(() => {
    if (!isOpenChainsModal) setSelectedTokenInputBox(null)
  }, [isOpenChainsModal])

  const handleDeposit = useCallback(async () => {
    console.log('called handleDeposit')
    console.log(depositCallbackState, depositCallbackError)
    if (!depositCallback) return
    try {
      setAwaitingBridgeConfirmation(true)
      const txHash = await depositCallback()
      setAwaitingBridgeConfirmation(false)
      console.log({ txHash })
      toggleReviewModal(false)
      setAmountIn('')
    } catch (e) {
      setAwaitingBridgeConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [depositCallbackState, depositCallback, depositCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    }
    if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing />
        </MainButton>
      )
    }
    if (showApproveLoader) {
      return (
        <MainButton active>
          Approving <DotFlashing />
        </MainButton>
      )
    }
    if (showApprove) {
      return <MainButton onClick={handleApprove}>Allow us to spend {tokenIn?.symbol}</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <ConnectWallet />
    }
    if (showApprove) {
      return null
    }
    if (bridgePaused) {
      return <MainButton disabled>Bridge Paused</MainButton>
    }
    if (insufficientBalance) {
      return <MainButton disabled>Insufficient {tokenIn?.symbol} Balance</MainButton>
    }
    return (
      <MainButton
        onClick={() => {
          if (amountIn && amountIn !== '0' && amountIn !== '' && amountIn !== '0.') toggleReviewModal(true)
        }}
      >
        Bridge {tokenIn?.symbol}
      </MainButton>
    )
  }
  // const items = usePoolStats()

  const info = useMemo(() => {
    return [
      // { title: 'Max Slippage', value: '0.1%' },
      // { title: 'Txn Deadline', value: '20 min' },
      // { title: 'Network Fee', value: '0.001 FTM' },
    ]
  }, [])

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
                value={amountIn} // TODO: No fee?
                onChange={(value: string) => console.log(value)}
                disabled
                onTokenSelect={() => onTokenSelect('tokenOut')}
              />
              <div style={{ marginTop: '20px' }}></div>
              {getApproveButton()}
              {getActionButton()}
            </BridgeWrapper>
            <BottomWrap>
              <Info size={16} />
              <BridgeInfo>{'Approve > Deposit > Switch Network > Claim Token'}</BridgeInfo>
            </BottomWrap>
          </Wrapper>
          <Claim />
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
        amountsOut={[amountIn]}
        info={info}
        data={''}
        buttonText={'Confirm Bridge'}
        awaiting={awaitingDepositConfirmation}
        summary={`Bridging ${amountIn} ${tokenIn?.symbol} from ${ChainInfo[tokenIn?.chainId].label} to ${
          ChainInfo[tokenOut?.chainId].label
        }`}
        handleClick={handleDeposit}
      />
    </>
  )
}
