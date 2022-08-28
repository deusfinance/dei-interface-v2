import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown } from 'react-feather'
import Image from 'next/image'

import BRIDGE_LOGO from '/public/static/images/pages/bridge/ic_bridge.svg'
import MUON_LOGO from '/public/static/images/pages/bridge/muon_logo.svg'
import DEI_BACKGROUND from '/public/static/images/pages/bridge/ic_bridge_dei.svg'
import DEUS_BACKGROUND from '/public/static/images/pages/bridge/ic_bridge_deus.svg'

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
import { RowCenter } from 'components/Row'
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
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import Claim from 'components/App/Redemption/Claim'
import usePoolStats from 'components/App/StableCoin/PoolStats'
import TokensBox from 'components/App/Bridge/TokensBox'
import { Token } from '@sushiswap/core-sdk'

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

export default function Bridge() {
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
  const [amountOut1, setAmountOut1] = useState('')
  const [amountOut2, setAmountOut2] = useState('')
  const [selectedToken, setSelectedToken] = useState<Token>(DEUS_TOKEN)

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
          <Image src={BRIDGE_LOGO} height={'90px'} alt="Logo" />
          <MuonWrap>
            <MuonText>Secured by Muon</MuonText>
            <Image src={MUON_LOGO} height={'90px'} alt="Logo" />
          </MuonWrap>
        </Hero>
        <MainWrap>
          <Wrapper>
            <Tableau title={'Bridge'} imgSrc={false ? DEI_BACKGROUND : DEUS_BACKGROUND} />

            <BridgeWrapper>
              <TokensBox
                title={'Select token to bridge'}
                tokens={[DEUS_TOKEN, DEI_TOKEN]}
                selectedToken={selectedToken}
                onTokenSelect={setSelectedToken}
              />
              <Separator />
              <InputBox
                currency={deiCurrency}
                value={amountIn}
                onChange={(value: string) => setAmountIn(value)}
                disabled={expiredPrice}
                onTokenSelect={() => console.log('on token select')}
              />
              <ArrowDown />

              <InputBox
                currency={usdcCurrency}
                value={amountOut1}
                onChange={(value: string) => console.log(value)}
                disabled={true}
              />
              <div style={{ marginTop: '20px' }}></div>
              {getActionButton()}
            </BridgeWrapper>
            <BottomWrapper>
              <InfoItem name={'Redemption Fee'} value={redemptionFee + '%'} />
              <InfoItem name={'Redeem Ratio'} value={Number(redeemCollateralRatio).toString() + '%'} />
              <InfoItem name={'Mint Ratio'} value={Number(mintCollateralRatio).toString() + '%'} />
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
        buttonText={'Confirm Redeem'}
        awaiting={awaitingRedeemConfirmation}
        summary={`Redeeming ${amountIn} DEI to ${amountOut1} USDC and ${amountOut2} DEUS`}
        handleClick={handleRedeem}
      />
    </>
  )
}
