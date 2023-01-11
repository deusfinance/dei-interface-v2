import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import REDEEM_IMG from '/public/static/images/pages/redemption/TableauBackground.svg'
import DEUS_LOGO from '/public/static/images/pages/redemption/DEUS_logo.svg'

import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { tryParseAmount } from 'utils/parse'
import { getTimeLength } from 'utils/time'

import { useCurrencyBalance } from 'state/wallet/hooks'
import {
  useRedemptionFee,
  useRedeemPaused,
  useExpiredPrice,
  useCollateralCollectionDelay,
  useDeusCollectionDelay,
} from 'state/dei/hooks'
import useWeb3React from 'hooks/useWeb3'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useGetCollateralRatios, useRedeemAmountOut } from 'hooks/useRedemptionPage'
import useUpdateCallback from 'hooks/useOracleCallback'

import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import InputBox from 'components/InputBox'
import DefaultReviewModal from 'components/ReviewModal/DefaultReviewModal'
import {
  BottomWrapper,
  Container,
  InputWrapper,
  Wrapper,
  MainButton,
  ConnectWallet,
  GradientButton,
} from 'components/App/StableCoin'
import InputBoxInDollar from 'components/App/Redemption/InputBoxInDollar'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import Claim from 'components/App/Redemption/Claim'
import usePoolStats from 'components/App/StableCoin/PoolStats'
import WarningModal from 'components/ReviewModal/Warning'
import { ExternalLink } from 'components/Link'
import ExternalLinkIcon from '/public/static/images/pages/common/down.svg'

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
  const [amountIn, setAmountIn] = useState('')
  const redemptionFee = useRedemptionFee()
  const redeemPaused = useRedeemPaused()
  // const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const usdcCurrency = USDC_TOKEN
  const deusCurrency = DEUS_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)
  const [isOpenWarningModal, toggleWarningModal] = useState(false)
  const [amountOut1, setAmountOut1] = useState('')
  const [amountOut2, setAmountOut2] = useState('')

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

  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const [awaitingUpdateConfirmation, setAwaitingUpdateConfirmation] = useState<boolean>(false)

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
      toggleWarningModal(true)
      toggleReviewModal(false)
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
  const readMoreLink = 'https://docs.deus.finance/usddei/redeeming-usddei'
  const readMoreItem: { name: string; value: JSX.Element; link?: string } = {
    name: '',
    value: (
      <ExternalLink style={{ color: '#6F7380' }} href={readMoreLink}>
        Read more <Image alt="external-link" src={ExternalLinkIcon} width={8} height={8} />
      </ExternalLink>
    ),
    link: readMoreLink,
  }
  const items = [...usePoolStats(), readMoreItem]
  console.log({ items })

  const collateralCollectionDelay = useCollateralCollectionDelay()
  const deusCollectionDelay = useDeusCollectionDelay()

  const info = useMemo(() => {
    return [
      {
        title: 'USDC claimable time',
        value: getTimeLength(collateralCollectionDelay * 1000).fullLength ?? '30 sec',
      },
      { title: 'DEUS claimable time', value: getTimeLength(deusCollectionDelay * 1000).fullLength ?? '30 min' },
    ]
  }, [collateralCollectionDelay, deusCollectionDelay])

  return (
    <>
      <Container>
        <Hero>
          <Image src={DEUS_LOGO} height={'90px'} alt="Logo" />
          <StatsHeader isAddress={false} items={items} />
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
              <InputBoxInDollar currency={deusCurrency} value={amountOut2} />
              <div style={{ marginTop: '20px' }}></div>
              {getActionButton()}
            </RedemptionWrapper>
            <BottomWrapper>
              <InfoItem name={'Redemption Fee'} value={redemptionFee + '%'} />
              <InfoItem name={'Redeem Ratio'} value={Number(redeemCollateralRatio).toString() + '%'} />
              <InfoItem name={'Mint Ratio'} value={Number(mintCollateralRatio).toString() + '%'} />
            </BottomWrapper>
          </Wrapper>
          <Claim redeemCollateralRatio={redeemCollateralRatio} handleUpdatePrice={handleUpdatePrice} />
        </MainWrap>
      </Container>

      <WarningModal
        isOpen={isOpenWarningModal}
        toggleModal={(action: boolean) => toggleWarningModal(action)}
        summary={['Transaction rejected', `Redeeming ${amountIn} DEI to ${amountOut1} USDC and ${amountOut2} DEUS`]}
      />

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
        buttonText={'Confirm Redeem'}
        awaiting={awaitingRedeemConfirmation}
        summary={`Redeeming ${amountIn} DEI to ${amountOut1} USDC and ${amountOut2} DEUS`}
        handleClick={handleRedeem}
      />
    </>
  )
}
