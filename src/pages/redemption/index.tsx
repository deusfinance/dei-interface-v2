import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import REDEEM_IMG from '/public/static/images/pages/redemption/TableauBackground.svg'
import DEUS_LOGO from '/public/static/images/pages/redemption/DEUS_logo.svg'

import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { CollateralPool, DynamicRedeemer } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { tryParseAmount } from 'utils/parse'
import { truncateAddress } from 'utils/address'
import { formatDollarAmount } from 'utils/numbers'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useRedemptionFee, useRedeemPaused, useExpiredPrice } from 'state/dei/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useGetCollateralRatios, useRedeemAmountOut } from 'hooks/useRedemptionPage'
import { useDeusPrice, useUSDCPrice } from 'hooks/useCoingeckoPrice'
import useUpdateCallback from 'hooks/useOracleCallback'

import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import { BottomWrapper, Container, InputWrapper, Wrapper, MainButton, ConnectWallet } from 'components/App/StableCoin'
import InputBox from 'components/InputBox'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'
import Claim from 'components/App/Redemption/Claim'

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
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const redemptionFee = useRedemptionFee()
  const redeemPaused = useRedeemPaused()
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
  const expiredPrice = useExpiredPrice()

  const { collateralAmount, deusValue } = useRedeemAmountOut(amountIn)

  useEffect(() => {
    setAmountOut1(collateralAmount)
    setAmountOut2(deusValue)
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

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? DynamicRedeemer[chainId] : undefined), [chainId])
  const [approvalState, approveCallback] = useApproveCallback(deiCurrency ?? undefined, spender)
  const [showApprove, showApproveLoader] = useMemo(() => {
    const show = deiCurrency && approvalState !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalState === ApprovalState.PENDING]
  }, [deiCurrency, approvalState, amountIn])

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
      return <ConnectWallet />
    } else if (showApprove) {
      return null
    } else if (redeemPaused) {
      return <MainButton disabled>Redeem Paused</MainButton>
    } else if (awaitingUpdateConfirmation) {
      return (
        <MainButton onClick={handleUpdatePrice}>
          Updating Oracle
          <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    } else if (expiredPrice) {
      return <MainButton onClick={handleUpdatePrice}>Update Oracle</MainButton>
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
          if (amountIn && amountIn !== '0' && amountIn !== '' && amountIn !== '0.') toggleReviewModal(true)
        }}
      >
        Redeem DEI
      </MainButton>
    )
  }

  const items = useMemo(
    () => [
      { name: 'DEI Price', value: '$1.00' },
      { name: 'USDC Price', value: formatDollarAmount(parseFloat(usdcPrice), 2) ?? '-' },
      { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusCoingeckoPrice), 2) ?? '-' },
      {
        name: 'Pool(V3)',
        value: truncateAddress(CollateralPool[chainId ?? SupportedChainId.FANTOM]) ?? '-',
        isLink: true,
        link: CollateralPool[chainId ?? SupportedChainId.FANTOM],
      },
    ],
    [usdcPrice, deusCoingeckoPrice, chainId]
  )

  //TODO: after adding loading animation please read this data from contract in /src/state/dei
  const info = useMemo(
    () => [
      { title: 'USDC claimable time', value: '30 sec' },
      { title: 'DEUS claimable time', value: '30 min' },
    ],
    []
  )
  return (
    <>
      <Container>
        <Hero>
          <Image src={DEUS_LOGO} height={'90px'} alt="Logo" />
          <StatsHeader items={items} />
        </Hero>
        <MainWrap>
          <Wrapper>
            <Tableau title={'Redeem DEI'} imgSrc={REDEEM_IMG} />
            <RedemptionWrapper>
              <InputBox
                currency={deiCurrency}
                value={amountIn}
                onChange={(value: string) => setAmountIn(value)}
                disabled={expiredPrice}
              />
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
                inDollar={true}
              />
              <div style={{ marginTop: '20px' }}></div>
              {getApproveButton()}
              {getActionButton()}
            </RedemptionWrapper>
            <BottomWrapper>
              <InfoItem name={'Redemption Fee'} value={redemptionFee + '%'} />
              <InfoItem name={'Redeem Ratio'} value={Number(redeemCollateralRatio).toString() + '%'} />
              <InfoItem name={'Mint Ratio'} value={Number(mintCollateralRatio).toString() + '%'} />
              {/* <InfoItem name={'USDC Ratio'} value={(Number(redeemCollateralRatio) / 100).toString()} /> */}
              {/* <InfoItem name={'DEUS Ratio($)'} value={((100 - Number(redeemCollateralRatio)) / 100).toString()} /> */}
            </BottomWrapper>
          </Wrapper>
          <Claim redeemCollateralRatio={redeemCollateralRatio} handleUpdatePrice={handleUpdatePrice} />
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
