import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import REDEEM_IMG from '/public/static/images/pages/redemption/TableauBackground.svg'
import DEUS_LOGO from '/public/static/images/pages/redemption/DEUS_logo.svg'

import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { CollateralPool, DynamicRedeemer } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'
import { getRemainingTime } from 'utils/time'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useGetCollateralRatios, useRedeemAmountOut, useRedeemData } from 'hooks/useRedemptionPage'

import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import { BottomWrapper, Container, InputWrapper, Title, Wrapper, MainButton } from 'components/App/StableCoin'
import InputBox from 'components/InputBox'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'
import Claim from 'components/App/Redemption/Claim'
import { useDeusPrice, useUSDCPrice } from 'hooks/useCoingeckoPrice'
import { formatDollarAmount } from 'utils/numbers'
import { SupportedChainId } from 'constants/chains'
import { truncateAddress } from 'utils/address'

const MainWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: -10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-direction: column-reverse;
  `}
`

const RedemptionWrapper = styled(InputWrapper)`
  & > * {
    &:nth-child(3) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:nth-child(5) {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }
`

const PlusIcon = styled(Plus)`
  margin: -12.5px auto;
  margin-left: 57px;
  z-index: 1000;
  padding: 3px;
  border: 1px solid ${({ theme }) => theme.bg4};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text2};
`

export default function Redemption() {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  // const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const usdcCurrency = USDC_TOKEN
  const deusCurrency = DEUS_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [amountOut1, setAmountOut1] = useState('')
  const [amountOut2, setAmountOut2] = useState('')

  // const deiPrice = useDeiPrice()
  const usdcPrice = useUSDCPrice()
  const deusCoingeckoPrice = useDeusPrice()

  const { collateralAmount, deusValue } = useRedeemAmountOut(amountIn)

  useEffect(() => {
    setAmountOut1(collateralAmount)
    setAmountOut2(deusValue)
  }, [collateralAmount, deusValue])

  const { redeemPaused, redeemTranche } = useRedeemData()

  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(deiAmount)

  const { redeemCollateralRatio } = useGetCollateralRatios()

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState, amountIn])

  const { diff } = getRemainingTime(redeemTranche.endTime)

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const handleRedeem = useCallback(async () => {
    console.log('called handleRedeem')
    console.log(redeemCallbackState, redeemCallbackError)
    if (!redeemCallback) return
    try {
      setAwaitingRedeemConfirmation(true)
      const txHash = await redeemCallback()
      setAwaitingRedeemConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingRedeemConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [redeemCallbackState, redeemCallback, redeemCallbackError])

  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account) {
      return null
    } else if (awaitingApproveConfirmation) {
      return (
        <MainButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    } else if (showApproveLoader) {
      return (
        <MainButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    } else if (showApprove) {
      return <MainButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    } else if (showApprove) {
      return null
    } else if (redeemPaused) {
      return <MainButton disabled>Redeem Paused</MainButton>
    } else if (diff < 0 && redeemTranche.trancheId != null) {
      return <MainButton disabled>Tranche Ended</MainButton>
    } else if (Number(amountOut1) > redeemTranche.amountRemaining) {
      return <MainButton disabled>Exceeds Available Amount</MainButton>
    } else if (insufficientBalance) {
      return <MainButton disabled>Insufficient {deiCurrency?.symbol} Balance</MainButton>
    }
    // if (awaitingRedeemConfirmation) {
    //   return (
    //     <MainButton>
    //       Redeeming DEI <DotFlashing style={{ marginLeft: '10px' }} />
    //     </MainButton>
    //   )
    // }
    return (
      <MainButton
        onClick={() => {
          if (amountIn && amountIn !== '0') toggleReviewModal(true)
        }}
      >
        Redeem DEI
      </MainButton>
    )
  }

  const items = [
    { name: 'DEI Price', value: '$1.00' },
    { name: 'USDC Price', value: formatDollarAmount(parseFloat(usdcPrice), 2) ?? '-' },
    { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusCoingeckoPrice), 2) ?? '-' },
    { name: 'Pool(V3)', value: truncateAddress(CollateralPool[chainId ?? SupportedChainId.FANTOM]) ?? '-' },
  ]

  const info = useMemo(
    () => [
      { title: 'USDC claimable time', value: '30s' },
      { title: 'DEUS claimable time', value: '8h' },
      // { title: 'Min Received', value: amountOut1 + ' USDC + ' + amountOut2 + ' DEUS' },
    ],
    []
  )
  return (
    <>
      <Container>
        <Hero>
          <Image src={DEUS_LOGO} height={'90px'} alt="Logo" />
          <Title>Redemption</Title>
          <StatsHeader items={items} />
        </Hero>
        <MainWrap>
          <Wrapper>
            <Tableau title={'Redeem DEI'} imgSrc={REDEEM_IMG} />
            <RedemptionWrapper>
              <InputBox currency={deiCurrency} value={amountIn} onChange={(value: string) => setAmountIn(value)} />
              <ArrowDown />

              <InputBox
                currency={usdcCurrency}
                value={amountOut1}
                onChange={(value: string) => console.log(value)}
                disabled={true}
              />
              <PlusIcon size={'24px'} />
              <InputBox
                currency={deusCurrency}
                value={amountOut2}
                onChange={(value: string) => console.log(value)}
                disabled={true}
              />
              <div style={{ marginTop: '20px' }}></div>
              {getApproveButton()}
              {getActionButton()}
            </RedemptionWrapper>
            <BottomWrapper>
              <InfoItem name={'USDC Ratio'} value={(Number(redeemCollateralRatio) / 100).toString()} />
              <InfoItem name={'DEUS Ratio'} value={((100 - Number(redeemCollateralRatio)) / 100).toString()} />
            </BottomWrapper>
          </Wrapper>
          <Claim redeemCollateralRatio={redeemCollateralRatio} />
        </MainWrap>
      </Container>

      <DefaultReviewModal
        title="Review Redeem Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[DEI_TOKEN]}
        outputTokens={[USDC_TOKEN, DEUS_TOKEN]}
        amountsIn={[amountIn]}
        amountsOut={[amountOut1, amountOut2]}
        info={info}
        data={''}
        buttonText={awaitingRedeemConfirmation ? 'Redeeming ' : 'Confirm Redeem'}
        awaiting={awaitingRedeemConfirmation}
        handleClick={handleRedeem}
      />
    </>
  )
}
