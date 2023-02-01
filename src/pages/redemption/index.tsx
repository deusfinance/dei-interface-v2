import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'
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
import WarningModal from 'components/ReviewModal/Warning'
import { Row, RowCenter } from 'components/Row'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import Claim from 'components/App/Redemption/Claim'
import Column from 'components/Column'

const MainContainer = styled(Container)`
  margin-top: 68px;
`
const ActionButton = styled.div`
  width: 100%;
  & > div {
    background: linear-gradient(90deg, #e0974c 0%, #c93f6f 100%);
    &:hover {
      background: linear-gradient(270deg, #e0974c 0%, #c93f6f 100%);

      & > div {
        background: linear-gradient(270deg, #e0974c 0%, #c93f6f 100%);
      }
    }
    & > div {
      background: linear-gradient(90deg, #e0974c 0%, #c93f6f 100%);
      & > span {
        color: white;
        background: transparent;
        -webkit-text-fill-color: white;
      }
    }
  }
`
const RedemptionWrapper = styled(InputWrapper)`
  margin-top: 2px;
  background-color: ${({ theme }) => theme.bg1};
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
const TableauContainer = styled(RowCenter)`
  align-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  & > div {
    background-color: ${({ theme }) => theme.bg1};
  }
  span {
    font-size: 20px;
  }
`
const ArrowContainer = styled(RowCenter)`
  border: 1px solid ${({ theme }) => theme.text2};
  width: fit-content;
  padding: 3px 12px;
  border-radius: 4px;
  & > p {
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.text2};
    margin-right: 24px;
  }
  & > svg {
    color: ${({ theme }) => theme.text2};
  }
`
const CustomWrapper = styled(Wrapper)`
  width: clamp(250px, 90%, 800px);
  border-radius: 0px;
  & > div {
    width: 100%;
    align-items: flex-start;
    column-gap: 20px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: clamp(250px, 90%, 500px);
    &>div{
      flex-direction:column;
    }
  `}
`
const ClaimWrapper = styled.div`
  & > div {
    margin-top: 0px;
    border: none;
    padding: 0px;
    & > div:first-child,
    & > div:last-child {
      background-color: ${({ theme }) => theme.bg1};
      min-height: 60px;
    }
    & > div:nth-child(2) {
      margin-top: 2px;
      background-color: ${({ theme }) => theme.bg2};
    }
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    &>div{
      margin-top: 20px;
      width:100% !important;
    }
    width:100%
  `}
`

export default function Redemption() {
  useWeb3NavbarOption({ reward: true, wallet: true, network: true })
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
        Redeem
      </MainButton>
    )
  }

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
      <MainContainer>
        <CustomWrapper>
          <Row>
            <Column style={{ width: '100%' }}>
              <TableauContainer>
                <Tableau title={'Redeem DEI'} />
              </TableauContainer>
              <RedemptionWrapper>
                <InputBox
                  currency={deiCurrency}
                  value={amountIn}
                  onChange={(value: string) => setAmountIn(value)}
                  disabled={expiredPrice}
                />
                <ArrowContainer>
                  <p>Redeem DEI</p>
                  <ArrowDown />
                </ArrowContainer>

                <InputBox
                  currency={usdcCurrency}
                  value={amountOut1}
                  onChange={(value: string) => console.log(value)}
                  disabled={true}
                />
                <PlusIcon size={'24px'} />
                <InputBoxInDollar currency={deusCurrency} value={amountOut2} />
                <div style={{ marginTop: '20px' }}></div>
                <ActionButton>{getActionButton()}</ActionButton>
              </RedemptionWrapper>
              <BottomWrapper>
                <InfoItem name={'Redemption Fee'} value={redemptionFee + '%'} />
                <InfoItem name={'Redeem Ratio'} value={Number(redeemCollateralRatio).toString() + '%'} />
                <InfoItem name={'Mint Ratio'} value={Number(mintCollateralRatio).toString() + '%'} />
              </BottomWrapper>
            </Column>
            <ClaimWrapper>
              <Claim redeemCollateralRatio={redeemCollateralRatio} handleUpdatePrice={handleUpdatePrice} />
            </ClaimWrapper>
          </Row>
        </CustomWrapper>
      </MainContainer>

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
