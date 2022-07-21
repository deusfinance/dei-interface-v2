import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useRedeemAmountsOut } from 'hooks/useRedemptionPage'
import { tryParseAmount } from 'utils/parse'
import { DEIv2_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { DynamicRedeemer } from 'constants/addresses'
import MINT_IMG from '../../../public/static/images/pages/mint/TableauBackground.svg'
import DEI_LOGO from '../../../public/static/images/pages/mint/DEI_Logo.svg'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Migration/InputBox'
import { RowEnd } from 'components/Row'
import Image from 'next/image'
import AdvancedOptions from 'components/App/Swap/AdvancedOptions'
import DashboardHeader from 'components/DashboardHeader'
import {
  BottomWrapper,
  Container,
  InputWrapper,
  TableauTitle,
  Title,
  TopTableau,
  Wrapper,
} from 'components/App/StableCoin'
import InformationWrapper from 'components/App/StableCoin/InformationWrapper'

const MigrationButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const TitleIMGWrap = styled(RowEnd)`
  border-radius: 15px;
`

const SlippageWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`

export default function Migration() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiv2Currency = DEIv2_TOKEN
  const usdcCurrency = USDC_TOKEN
  const usdcCurrencyBalance = useCurrencyBalance(account ?? undefined, usdcCurrency)

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
        <MigrationButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </MigrationButton>
      )
    }
    if (showApproveLoader) {
      return (
        <MigrationButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </MigrationButton>
      )
    }
    if (showApprove)
      return <MigrationButton onClick={handleApprove}>Allow us to spend {usdcCurrency?.symbol}</MigrationButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <MigrationButton onClick={toggleWalletModal}>Connect Wallet</MigrationButton>

    if (showApprove) return null

    if (insufficientBalance)
      return <MigrationButton disabled>Insufficient {usdcCurrency?.symbol} Balance</MigrationButton>

    if (awaitingRedeemConfirmation) {
      return (
        <MigrationButton>
          Migrating to {deiv2Currency?.symbol} <DotFlashing style={{ marginLeft: '10px' }} />
        </MigrationButton>
      )
    }
    return <MigrationButton onClick={() => handleMint()}>Mint {deiv2Currency?.symbol}</MigrationButton>
  }

  // TODO: move items to use memo
  const items = [
    { name: 'DEI Price', value: '$0.5' },
    { name: 'Global Dei Borrowed', value: '0.77m' },
    { name: 'Total Supply', value: '72.53m' },
    { name: 'Total Protocol Holdings', value: '24.64m' },
    { name: 'Total DEI Bonded', value: '18.88m' },
  ]
  return (
    <Container>
      <Hero>
        <Image src={DEI_LOGO} height={'90px'} alt="Logo" />
        <Title>Mint</Title>
        <DashboardHeader items={items} />
      </Hero>

      <Wrapper>
        <TopTableau>
          <TitleIMGWrap>
            <Image src={MINT_IMG} height={'90px'} alt="nft" />
          </TitleIMGWrap>

          <TableauTitle>Mint DEI</TableauTitle>
        </TopTableau>
        <InputWrapper>
          <InputBox
            currency={usdcCurrency}
            value={amountIn}
            onChange={(value: string) => setAmountIn(value)}
            title={'from'}
          />
          <ArrowDown />
          <InputBox
            currency={deiv2Currency}
            value={amountOut1}
            onChange={(value: string) => console.log(value)}
            title={'to'}
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
          <InformationWrapper name={'Minter Contract'} value={'Proxy'} />
          <InformationWrapper name={'Minting Fee'} value={'Zero'} />
        </BottomWrapper>
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
