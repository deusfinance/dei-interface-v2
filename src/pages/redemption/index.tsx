import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import REDEEM_IMG from '/public/static/images/pages/redemption/TableauBackground.svg'
import DEUS_LOGO from '/public/static/images/pages/redemption/DEUS_logo.svg'

import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { DynamicRedeemer } from 'constants/addresses'
import { tryParseAmount } from 'utils/parse'
import { getRemainingTime } from 'utils/time'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
// import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useRedeemAmountOut, useRedeemData } from 'hooks/useRedemptionPage'

import { DotFlashing } from 'components/Icons'
import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import { BottomWrapper, Container, InputWrapper, Title, Wrapper, MainButton } from 'components/App/StableCoin'
import InputBox from 'components/InputBox'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
// import { toBN } from 'utils/numbers'
import { useCollateralRatio } from 'state/dei/hooks'
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

// const Description = styled.div`
//   font-size: 0.85rem;
//   line-height: 1.25rem;
//   margin-left: 10px;
//   color: ${({ theme }) => darken(0.4, theme.text1)};
// `

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

  const collatRatio = useCollateralRatio()
  // const collatRatioBN = toBN(collatRatio)
  // const oneHundred = toBN(100)

  const { collateralAmount, deusValue } = useRedeemAmountOut(amountIn)

  useEffect(() => {
    setAmountOut1(collateralAmount)
    setAmountOut2(deusValue)
  }, [collateralAmount, deusValue])

  // const amountOut1 = useMemo(() => {
  //   if (!collatRatioBN || !amountIn) return '0'
  //   return toBN(amountIn).times(collatRatioBN).div(oneHundred).toString()
  // }, [amountIn, collatRatioBN, oneHundred])

  // const amountOut2 = useMemo(() => {
  //   if (!collatRatioBN || !amountIn) return '0'
  //   return toBN(amountIn).times(oneHundred.minus(collatRatioBN)).div(oneHundred).toString()
  // }, [amountIn, oneHundred, collatRatioBN])

  const { redeemPaused, redeemTranche } = useRedeemData()
  // console.log({ redeemPaused, rest })

  // Amount typed in either fields
  const deiAmount = useMemo(() => {
    return tryParseAmount(amountIn, deiCurrency || undefined)
  }, [amountIn, deiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!deiAmount) return false
    return deiCurrencyBalance?.lessThan(deiAmount)
  }, [deiCurrencyBalance, deiAmount])

  // const usdcAmount = useMemo(() => {
  //   return tryParseAmount(amountOut1, usdcCurrency || undefined)
  // }, [amountOut1, usdcCurrency])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(deiAmount)

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
    console.log(redeemCallbackState, redeemCallback, redeemCallbackError)
    if (!redeemCallback) return

    // let error = ''
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
    if (!isSupportedChainId || !account) {
      return null
    }
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
    if (showApprove) {
      return <MainButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    }
    if (showApprove) {
      return null
    }
    if (redeemPaused) {
      return <MainButton disabled>Redeem Paused</MainButton>
    }

    if (diff < 0 && redeemTranche.trancheId != null) {
      return <MainButton disabled>Tranche Ended</MainButton>
    }

    if (Number(amountOut1) > redeemTranche.amountRemaining) {
      return <MainButton disabled>Exceeds Available Amount</MainButton>
    }

    if (insufficientBalance) {
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
  // TODO: use useMemo for items
  const items = [
    { name: 'DEI Price ', value: '$1.00' },
    { name: 'USDC Price ', value: '$1.00' },
    { name: 'Total DEI Redeemed ', value: '$12M' },
  ]

  const info = useMemo(
    () => [
      { title: 'Max Slippage', value: '0.5' + ' %' },
      { title: 'Txn Deadline', value: '20 min' },
      { title: 'Network Fee', value: 'N/A' },
      { title: 'Min Received', value: amountOut1 + ' USDC + ' + amountOut2 + ' DEUS' },
    ],
    [amountOut1, amountOut2]
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
              {/* <div style={{ marginTop: '20px' }}></div>

              {
                <Row mt={'8px'}>
                  <Info data-for="id" data-tip={'Tool tip for hint client'} size={15} />
                  <Description>you will get an NFT {`"DEUS voucher"`} that will let you claim DEUS later .</Description>
                </Row>
              } */}
            </RedemptionWrapper>
            <BottomWrapper>
              <InfoItem name={'USDC Ratio'} value={'0.1???'} />
              <InfoItem name={'DEUS Ratio'} value={'0.9???'} />
            </BottomWrapper>
          </Wrapper>
          <Claim />
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
