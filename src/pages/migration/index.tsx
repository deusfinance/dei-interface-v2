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
import { DEI_TOKEN, DEIv2_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { DynamicRedeemer } from 'constants/addresses'
import Migration_IMG from '/public/static/images/pages/mint/TableauBackground.svg'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import Hero, { HeroSubtext } from 'components/Hero'
import InputBox from 'components/App/Migration/InputBox'
import { RowEnd } from 'components/Row'
import Image from 'next/image'

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

export default function Migration() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const deiv2Currency = DEIv2_TOKEN
  const usdcCurrency = USDC_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)

  const { amountOut1, amountOut2 } = useRedeemAmountsOut(debouncedAmountIn, deiCurrency)

  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])

  const usdcAmount = useMemo(() => {
    return tryParseAmount(amountOut1, usdcCurrency || undefined)
  }, [amountOut1, usdcCurrency])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(deiCurrency, usdcCurrency, deiAmount, usdcAmount, amountOut2)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState, amountIn])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleMigrate = useCallback(async () => {
    console.log('called handleMigrate')
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
      return <MigrationButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</MigrationButton>

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <MigrationButton onClick={toggleWalletModal}>Connect Wallet</MigrationButton>

    if (showApprove) return null

    if (insufficientBalance)
      return <MigrationButton disabled>Insufficient {deiCurrency?.symbol} Balance</MigrationButton>

    if (awaitingRedeemConfirmation) {
      return (
        <MigrationButton>
          Migrating to {deiv2Currency?.symbol} <DotFlashing style={{ marginLeft: '10px' }} />
        </MigrationButton>
      )
    }
    return <MigrationButton onClick={() => handleMigrate()}>Migrate to {deiv2Currency?.symbol}</MigrationButton>
  }

  return (
    <Container>
      <Hero>
        <div>Migrate to DEIv2</div>
        <HeroSubtext>Turn your DEI to the next generation</HeroSubtext>
      </Hero>

      <TopTableau>
        <TitleIMGWrap>
          <Image src={Migration_IMG} height={'90px'} alt="nft" />
        </TitleIMGWrap>

        <TableauTitle>Migration</TableauTitle>
      </TopTableau>
      <Wrapper>
        <InputBox
          currency={deiCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'from'}
        />
        <ArrowDown color={'#d87466'} />
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
      </Wrapper>
    </Container>
  )
}
