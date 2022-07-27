import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useRedeemAmountsOut } from 'hooks/useRedemptionPage'
import { tryParseAmount } from 'utils/parse'
import { DEIv2_TOKEN, DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { DynamicRedeemer } from 'constants/addresses'
import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'
import DEI_LOGO from '/public/static/images/pages/mint/DEI_Logo.svg'

import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import InputBox from 'components/App/Migration/InputBox'
import { RowBetween } from 'components/Row'
import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import StatsHeader from 'components/StatsHeader'
import { BottomWrapper, Container, InputWrapper, Title, Wrapper, MainButton } from 'components/App/StableCoin'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import TokensModal from 'components/App/StableCoin/TokensModal'
import { MINT__INPUTS } from 'constants/inputs'
import { SupportedChainId } from 'constants/chains'

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
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiv2Currency = DEIv2_TOKEN
  const usdcCurrency = USDC_TOKEN
  const usdcCurrencyBalance = useCurrencyBalance(account ?? undefined, usdcCurrency)
  const [isOpenTokensModal, toggleTokensModal] = useState(false)
  const [inputToken, setInputToken] = useState<number>(0)

  // TODO: this for test
  const tokens = useMemo(() => [[DEI_TOKEN], [USDC_TOKEN], [USDC_TOKEN, DEUS_TOKEN]], [])
  // const tokens = useMemo(() => MINT__INPUTS[chainId ?? SupportedChainId.FANTOM], [])

  const [slippage, setSlippage] = useState(0.5)

  const { amountOut1, amountOut2 } = useRedeemAmountsOut(debouncedAmountIn, usdcCurrency)

  const usdcAmount = useMemo(() => {
    return tryParseAmount(amountIn, usdcCurrency || undefined)
  }, [amountIn, usdcCurrency])

  const insufficientBalance = useMemo(() => {
    if (!usdcAmount) return false
    return usdcCurrencyBalance?.lessThan(usdcAmount)
  }, [usdcCurrencyBalance, usdcAmount])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(usdcCurrency, usdcCurrency, usdcAmount, usdcAmount, amountOut2)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(usdcCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = usdcCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [usdcCurrency, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleMint = useCallback(async () => {
    console.log('called handleMint')
    console.log(redeemCallbackState, redeemCallback, redeemCallbackError)
    if (!redeemCallback) return

    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await redeemCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
        // error = e.message
      } else {
        console.error(e)
        // error = 'An unknown error occurred.'
      }
    }
  }, [redeemCallbackState, redeemCallback, redeemCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) return null

    if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    if (showApproveLoader) {
      return (
        <MainButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    if (showApprove) return <MainButton onClick={handleApprove}>Allow us to spend {usdcCurrency?.symbol}</MainButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>

    if (showApprove) return null

    if (insufficientBalance) return <MainButton disabled>Insufficient {usdcCurrency?.symbol} Balance</MainButton>

    if (awaitingRedeemConfirmation) {
      return (
        <MainButton>
          Migrating to {deiv2Currency?.symbol} <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleMint()}>Mint {deiv2Currency?.symbol}</MainButton>
  }

  // TODO: move items to use memo
  const items = [
    { name: 'DEI Price', value: '$0.5?' },
    { name: 'Collateral Ratio', value: '43.00%?' },
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
          {tokens[inputToken].length > 1 ? (
            <ComboInputBox>
              <InputBox
                currency={tokens[inputToken][0]}
                value={amountOut1}
                onChange={(value: string) => console.log(value)}
                disabled={true}
                onTokenSelect={() => {
                  toggleTokensModal(true)
                }}
              />
              <PlusIcon size={'24px'} />
              <InputBox
                currency={tokens[inputToken][1]}
                value={amountOut2}
                onChange={(value: string) => console.log(value)}
                disabled={true}
                onTokenSelect={() => {
                  toggleTokensModal(true)
                }}
              />
            </ComboInputBox>
          ) : (
            <InputBox
              currency={tokens[inputToken][0]}
              value={amountIn}
              onChange={(value: string) => setAmountIn(value)}
              onTokenSelect={() => {
                toggleTokensModal(true)
              }}
            />
          )}

          <ArrowDown />
          <InputBox
            currency={deiv2Currency}
            value={amountOut1}
            onChange={(value: string) => console.log(value)}
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
        selectedToken={inputToken}
        setToken={setInputToken}
      />
    </Container>
  )
}
