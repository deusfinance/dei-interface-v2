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
import useBondsCallback from 'hooks/useBondsCallback'
import { useBondsAmountsOut, useBonderData } from 'hooks/useBondsPage'
import { tryParseAmount } from 'utils/parse'
import NFT_IMG from '/public/static/images/pages/bonds/TR-NFT.svg'

import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { RowEnd } from 'components/Row'
import InputBox from 'components/App/Redemption/InputBox'
import { DeiBonder } from 'constants/addresses'
import { DEI_TOKEN, BDEI_TOKEN } from 'constants/tokens'
import InfoBox from 'components/App/Bonds/InfoBox'
import { NavigationTypes } from 'components/StableCoin'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 500px);
  background-color: rgb(13 13 13);
  padding: 20px 15px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 15px;
  justify-content: center;

  & > * {
    &:nth-child(2) {
      margin: 15px auto;
    }
  }
`

const NftText = styled.div`
  white-space: nowrap;
  font-size: 0.85rem;
  position: absolute;
  margin-left: 10px;
  left: 0;
  top: 20px;
  z-index: 10;
  color: #f36c6c;
  padding: 2px;
  background: #0d0d0d;
  border-radius: 2px;
`
const NftTextDescription = styled.a`
  font-size: 0.7rem;
  white-space: nowrap;
  position: absolute;
  margin-left: 12px;
  border-radius: 2px;
  left: 0;
  top: 45px;
  z-index: 10;
  color: #ffffff;
  background: #0d0d0d;
  padding: 2px;
  /* text-decoration: underline;
  cursor: pointer; */
`

const PlusIcon = styled(Plus)`
  margin: -14px auto;
  z-index: 1000;
  padding: 3px;
  border: 1px solid black;
  border-radius: 15px;
  background-color: rgb(0 0 0);
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 15px;
`
const NftWrap = styled(RowEnd)`
  position: relative;
  border: 1px solid #1c1c1c;
  height: 90px;
  border-radius: 15px;
`

export default function Mint({ onSwitch }: { onSwitch: any }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [amountIn, setAmountIn] = useState('')
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const bDeiCurrency = BDEI_TOKEN
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)

  const { amountOut } = useBondsAmountsOut(debouncedAmountIn)
  const { bondingPaused } = useBonderData()
  // Amount typed in either fields
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
  } = useBondsCallback(deiCurrency, deiAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)
  const spender = useMemo(() => (chainId ? DeiBonder[chainId] : undefined), [chainId])
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

  const handleMint = useCallback(async () => {
    console.log('called handleMint')
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
        <RedeemButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApproveLoader) {
      return (
        <RedeemButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }
    if (showApprove) {
      return <RedeemButton onClick={handleApprove}>Allow us to spend {deiCurrency?.symbol}</RedeemButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <RedeemButton onClick={toggleWalletModal}>Connect Wallet</RedeemButton>
    }
    if (showApprove) {
      return null
    }

    if (bondingPaused) {
      return <RedeemButton disabled>Mint Paused</RedeemButton>
    }
    if (insufficientBalance) {
      return <RedeemButton disabled>Insufficient {deiCurrency?.symbol} Balance</RedeemButton>
    }

    if (awaitingRedeemConfirmation) {
      return (
        <RedeemButton>
          Minting bDEI <DotFlashing style={{ marginLeft: '10px' }} />
        </RedeemButton>
      )
    }

    return <RedeemButton onClick={() => handleMint()}>Mint bDEI</RedeemButton>
  }

  return (
    <>
      <Wrapper>
        <InputBox
          currency={deiCurrency}
          value={amountIn}
          onChange={(value: string) => setAmountIn(value)}
          title={'From'}
        />
        <ArrowDown style={{ cursor: 'pointer' }} onClick={() => onSwitch(NavigationTypes.SWAP)} />

        <InputBox
          currency={bDeiCurrency}
          value={amountOut}
          onChange={(value: string) => console.log(value)}
          title={'To'}
          disabled={true}
        />
        <PlusIcon size={'30px'} />
        <NftWrap>
          <>
            <NftText>Time Reduction NFT</NftText>
            <NftTextDescription>
              This NFT reduces the maturity
              <br /> time on your DEI bonds
            </NftTextDescription>
          </>
          <Image src={NFT_IMG} height={'90px'} alt="nft" />
        </NftWrap>
        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getActionButton()}
      </Wrapper>
      <InfoBox amountIn={debouncedAmountIn} />
    </>
  )
}
