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
import Mint_IMG from '../../../public/static/images/pages/migration/TableauBackground.svg'

import { PrimaryButton } from 'components/Button'
import { DotFlashing, Loader } from 'components/Icons'
import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import InputBox from 'components/App/Migration/InputBox'
import { RowBetween, RowEnd } from 'components/Row'
import Image from 'next/image'
import AdvancedOptions from 'components/App/Swap/AdvancedOptions'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid #444444;
  border-radius: 15px;
  justify-content: center;
  border-top-right-radius: 0;
  border-top-left-radius: 0;

  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

const MigrationButton = styled(PrimaryButton)`
  border-radius: 15px;
`

const TopTableau = styled(Wrapper)`
  margin-top: 50px;
  border-radius: 12px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  position: relative;
  padding: 0;
  border-radius: 12px 12px 0px 0px;
  height: 72px;
  background: #1b1b1b;
`

const TableauTitle = styled.span`
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  font-size: 24px;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
`

const TitleIMGWrap = styled(RowEnd)`
  border-radius: 15px;
`

const InfoWrapper = styled(RowBetween)`
  align-items: center;
  white-space: nowrap;
  font-size: 0.75rem;
  margin-top: 6px;
  height: 30px;
  width: 97%;
`

const ItemValue = styled.div`
  color: ${({ theme }) => theme.yellow4};
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

  return (
    <Container>
      <Hero>
        <div>Mint DEIv2</div>
        <HeroSubtext>Happy mint, Happy mint, Happy mint</HeroSubtext>
      </Hero>

      <TopTableau>
        <TitleIMGWrap>
          <Image src={Mint_IMG} height={'90px'} alt="nft" />
        </TitleIMGWrap>

        <TableauTitle>Mint</TableauTitle>
      </TopTableau>
      <Wrapper>
        <InputBox
          currency={usdcCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          type={'from'}
        />
        <ArrowDown color={'#d87466'} />
        <InputBox
          currency={deiv2Currency}
          value={amountOut1}
          onChange={(value: string) => console.log(value)}
          type={'to'}
          disabled={true}
        />
        <div style={{ marginTop: '30px' }}></div>
        {getApproveButton()}
        {getActionButton()}

        <SlippageWrapper>
          <AdvancedOptions slippage={slippage} setSlippage={setSlippage} />
        </SlippageWrapper>

        <InfoWrapper>
          <p>Minter Contract</p>
          <ItemValue> Proxy </ItemValue>
        </InfoWrapper>

        <InfoWrapper>
          <p>Minting Fee</p>
          {false ? <Loader /> : <ItemValue> Zero </ItemValue>}
        </InfoWrapper>
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
