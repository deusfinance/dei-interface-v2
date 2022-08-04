import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ArrowDown, Plus } from 'react-feather'
import Image from 'next/image'

import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import useWeb3React from 'hooks/useWeb3'
import useDebounce from 'hooks/useDebounce'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import useRedemptionCallback from 'hooks/useRedemptionCallback'
import { useRedeemAmountsOut, useRedeemData } from 'hooks/useRedemptionPage'
import { useERC721ApproveAllCallback } from 'hooks/useApproveNftCallback2'

import { tryParseAmount } from 'utils/parse'
import { BDEI_TOKEN, DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { DeiBondRedeemNFT, bDeiRedeemer } from 'constants/addresses'

import REDEEM_IMG from '/public/static/images/pages/bdei/TableauBackground.svg'
import DEI_LOGO from '/public/static/images/pages/bdei/DEI_logo.svg'
import BOND_NFT_LOGO from '/public/static/images/pages/bdei/BondNFT.svg'

import { DotFlashing, Info } from 'components/Icons'
import { Row } from 'components/Row'
import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import SelectBox from 'components/SelectBox'
import { BottomWrapper, Container, InputWrapper, Title, Wrapper, MainButton } from 'components/App/StableCoin'
import InputBox from 'components/InputBox'
import InfoItem from 'components/App/StableCoin/InfoItem'
import Tableau from 'components/App/StableCoin/Tableau'
import NFTsModal from 'components/App/bdei/NFTsModal'
import { formatAmount } from 'utils/numbers'
import { useDeiPrice } from 'hooks/useCoingeckoPrice'
import { useBonderData } from 'hooks/useBondsPage'
import { useDeiStats } from 'hooks/useDeiStats'

const NFTsWrapper = styled(InputWrapper)`
  & > * {
    &:nth-child(1) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    &:nth-child(3) {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    &:nth-child(4) {
      margin: 15px auto;
    }
    &:nth-child(2) {
      margin: -12.5px auto;
      margin-left: 57px;
    }
  }
`

const Description = styled.div`
  font-size: 0.85rem;
  line-height: 1.25rem;
  margin-left: 10px;
  color: ${({ theme }) => darken(0.4, theme.text1)};
`

const PlusIcon = styled(Plus)`
  margin: -14px auto;
  margin-left: 27px;
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
  const debouncedAmountIn = useDebounce(amountIn, 500)
  const deiCurrency = DEI_TOKEN
  const bdeiCurrency = BDEI_TOKEN
  const usdcCurrency = USDC_TOKEN
  const bdeiCurrencyBalance = useCurrencyBalance(account ?? undefined, bdeiCurrency)
  const deiCurrencyBalance = useCurrencyBalance(account ?? undefined, deiCurrency)
  const [isOpenNFTsModal, toggleNFTsModal] = useState(false)
  const [inputNFT, setInputNFT] = useState<number>(-1)

  /* const { amountIn, amountOut1, amountOut2, onUserInput, onUserOutput1, onUserOutput2 } = useRedeemAmounts() */
  const { amountOut1, amountOut2 } = useRedeemAmountsOut(debouncedAmountIn, bdeiCurrency)
  const { redeemPaused, redeemTranche } = useRedeemData()
  // console.log({ redeemPaused, rest })
  const [selectedNftId, setSelectedNftId] = useState('0')

  const deiPrice = useDeiPrice()
  const { deiBonded } = useBonderData()
  const { sPoolbDEILiquidity } = useDeiStats()

  // const dropdownOptions = listOfVouchers.map((tokenId: number) => ({
  //   label: `vDEUS #${tokenId}`,
  //   value: `${tokenId}`,
  // }))

  // Amount typed in either fields
  const bdeiAmount = useMemo(() => {
    return tryParseAmount(amountIn, bdeiCurrency || undefined)
  }, [amountIn, bdeiCurrency])

  const insufficientBalance = useMemo(() => {
    if (!bdeiAmount) return false
    return bdeiCurrencyBalance?.lessThan(bdeiAmount)
  }, [bdeiCurrencyBalance, bdeiAmount])

  const usdcAmount = useMemo(() => {
    return tryParseAmount(amountOut1, usdcCurrency || undefined)
  }, [amountOut1, usdcCurrency])

  const {
    state: redeemCallbackState,
    callback: redeemCallback,
    error: redeemCallbackError,
  } = useRedemptionCallback(bdeiAmount)

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingRedeemConfirmation, setAwaitingRedeemConfirmation] = useState<boolean>(false)

  const spender = useMemo(() => (chainId ? bDeiRedeemer[chainId] : undefined), [chainId])
  const [approvalStateERC721, approveCallbackERC721] = useERC721ApproveAllCallback(
    chainId ? DeiBondRedeemNFT[chainId] : undefined,
    spender
  )
  const showApproveERC721 = useMemo(() => approvalStateERC721 !== ApprovalState.APPROVED, [approvalStateERC721])

  const [approvalStateERC20, approveCallbackERC20] = useApproveCallback(bdeiCurrency ?? undefined, spender)

  const [showApproveERC20, showApproveLoaderERC20] = useMemo(() => {
    const show = bdeiCurrency && approvalStateERC20 !== ApprovalState.APPROVED && !!amountIn
    return [show, show && approvalStateERC20 === ApprovalState.PENDING]
  }, [bdeiCurrency, approvalStateERC20, amountIn])

  const handleApproveERC20 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallbackERC20()
    setAwaitingApproveConfirmation(false)
  }
  const handleApproveERC721 = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallbackERC721()
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
    if (showApproveLoaderERC20) {
      return (
        <MainButton active>
          Approving <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }
    if (showApproveERC721) {
      return <MainButton onClick={handleApproveERC721}>Approve NFT</MainButton>
    }
    if (showApproveERC20) {
      return <MainButton onClick={handleApproveERC20}>Approve {bdeiCurrency?.symbol}</MainButton>
    }
    return null
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) {
      return <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
    }
    if (showApproveERC20 || showApproveERC721) {
      return null
    }
    if (redeemPaused) {
      return <MainButton disabled>Redeem Paused</MainButton>
    }

    if (Number(amountOut1) > redeemTranche.amountRemaining) {
      return <MainButton disabled>Exceeds Available Amount</MainButton>
    }

    if (insufficientBalance) {
      return <MainButton disabled>Insufficient {deiCurrency?.symbol} Balance</MainButton>
    }
    if (awaitingRedeemConfirmation) {
      return (
        <MainButton>
          Redeeming DEI <DotFlashing style={{ marginLeft: '10px' }} />
        </MainButton>
      )
    }

    return <MainButton onClick={() => handleRedeem()}>Redeem DEI</MainButton>
  }

  const items = [
    // { name: 'DEI Price', value: formatDollarAmount(parseFloat(deiPrice), 2) ?? '-' },
    { name: 'Total DEI Claimed', value: formatAmount(deiBonded) ?? '-' },
    { name: 'Your bDEI Balance', value: formatAmount(sPoolbDEILiquidity, 2) + ' DEI' ?? '-' },
    { name: 'Your NFT Value', value: formatAmount(sPoolbDEILiquidity, 2) + ' DEI' ?? '-' },
    { name: 'Your NFT Maturity', value: 'in 139 days' },
    { name: 'Your Claimable DEI', value: '0.73m' },
  ]

  return (
    <Container>
      <Hero>
        <Image src={DEI_LOGO} height={'90px'} alt="DEI logo" />
        <Title>DEI Bond</Title>
        <StatsHeader items={items} />
      </Hero>
      <Wrapper>
        <Tableau title={'Redemption'} imgSrc={REDEEM_IMG} />
        <NFTsWrapper>
          <SelectBox
            icon={BOND_NFT_LOGO}
            placeholder="Select an NFT"
            value={inputNFT > -1 ? `DeiBond #${inputNFT}` : ''}
            onSelect={() => toggleNFTsModal(true)}
          />
          <PlusIcon size={'24px'} />
          <InputBox currency={bdeiCurrency} value={amountOut2} onChange={(value: string) => console.log(value)} />
          <ArrowDown />
          <InputBox
            currency={deiCurrency}
            value={amountIn}
            onChange={(value: string) => setAmountIn(value)}
            disabled={true}
          />
          <div style={{ marginTop: '20px' }}></div>
          {getApproveButton()}
          {getActionButton()}
          <div style={{ marginTop: '20px' }}></div>
          {
            <Row mt={'8px'}>
              <Info data-for="id" data-tip={'Tool tip for hint client'} size={15} />
              <Description>you will spend an {`"Time Reduction NFT"`} to redeem your bDEI.</Description>
            </Row>
          }
        </NFTsWrapper>
        <BottomWrapper>
          <InfoItem name={'USDC Ratio'} value={'0.1???'} />
          <InfoItem name={'DEUS Ratio'} value={'0.9???'} />
        </BottomWrapper>
      </Wrapper>

      <NFTsModal
        isOpen={isOpenNFTsModal}
        toggleModal={(action: boolean) => toggleNFTsModal(action)}
        selectedNFT={inputNFT}
        setNFT={setInputNFT}
      />
    </Container>
  )
}
