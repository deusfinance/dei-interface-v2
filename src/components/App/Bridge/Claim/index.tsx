import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'
import { formatUnits } from '@ethersproject/units'

// import IC_CLAIM_EMPTY from '/public/static/images/pages/redemption/ic_claim_empty.svg'
// import IC_CLAIM_EMPTY_MOBILE from '/public/static/images/pages/redemption/ic_claim_empty_mobile.svg'
import IC_CLAIM_LOADING from '/public/static/images/pages/bridge/ic_claim_loading.svg'
import IC_CLAIM_NOT_CONNECTED from '/public/static/images/pages/bridge/ic_claim_not_connected.svg'
import CLAIM_LOGO from '/public/static/images/pages/bridge/claim.svg'
import IC_CLAIM_LOADING_MOBILE from '/public/static/images/pages/bridge/ic_claim_loading_mobile.svg'
import IC_CLAIM_NOT_CONNECTED_MOBILE from '/public/static/images/pages/bridge/ic_claim_not_connected_mobile.svg'

import { DEUS_TOKEN } from 'constants/tokens'
// import { SupportedChainId } from 'constants/chains'
import { BN_TEN, toBN } from 'utils/numbers'

import { useCollateralCollectionDelay, useDeusCollectionDelay, useExpiredPrice } from 'state/dei/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useCollectCollateralCallback, useCollectDeusCallback } from 'hooks/useRedemptionCallback'
import { useGetDeusPrice } from 'hooks/useMintPage'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useGetPoolData } from 'hooks/useRedemptionPage'

import { Card } from 'components/Card'
import { Row, RowCenter } from 'components/Row'
import UpdateModal from 'components/ReviewModal/UpdateModal'
import InfoItem from 'components/App/StableCoin/InfoItem'
import { TokenBox } from './TokenBox'

const ActionWrap = styled(Card)`
  background: transparent;
  border-radius: 12px;
  margin-top: 25px;
  margin-left: 25px;
  width: 320px;
  padding: 2px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 20px auto;
    margin-bottom: 0;
    width: clamp(250px, 90%, 500px);
  `};
`

export const ClaimBox = styled.div`
  background: ${({ theme }) => theme.bg0};
  padding: 12px;
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  max-height: 380px;
  overflow: scroll;
`

const DeusBox = styled.div`
  /* background: ${({ theme }) => theme.bg2}; */
  /* border-radius: 12px; */
  /* border: 1px solid ${({ theme }) => theme.border3}; */
`

export const BottomRow = styled(Row)`
  flex-wrap: wrap;
  padding: 10px 10px;
  position: relative;
  background: ${({ theme }) => theme.bg2};
  margin-bottom: auto;
`

export const InfoHeader = styled.p`
  font-size: 10px;
  color: ${({ theme }) => theme.text1};
`

export const InfoSubHeader = styled.p`
  font-size: 10px;
  color: ${({ theme }) => theme.text3};
`

const InfoWrap = styled.div`
  background: ${({ theme }) => theme.bg1};
  padding: 0 15px 10px 15px;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 100%;
  z-index: 1;
`

const TitleWrap = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  width: 100%;
  height: 52px;
`

const Title = styled.div`
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.text1};

  margin-top: 12px;
  margin-left: 16px;
  margin-bottom: 12px;
`

const NoResultWrapper = styled.div<{ warning?: boolean }>`
  font-size: 14px;
  text-align: center;
  padding: 10px 12px;
  color: ${({ theme, warning }) => (warning ? theme.warning : 'white')};
`

const EmptyToken = styled.p`
  margin-top: 0.75rem;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.text2};
`

const NoTokens = styled.div`
  text-align: center;
  padding: 25px 0;
`

const BottomInfo = styled.div``

interface IPositions {
  usdAmount: string
  timestamp: string
}
export interface IToken {
  symbol: string
  index: number
  claimableBlock: number
  amount: number
  chainId: number
}

export default function RedeemClaim({
  redeemCollateralRatio,
  handleUpdatePrice,
}: {
  redeemCollateralRatio: string
  handleUpdatePrice: () => void
}) {
  const {
    allPositions,
    unRedeemedPositions,
    nextRedeemId,
    redeemCollateralBalances,
    isLoading,
  }: {
    allPositions: IPositions[]
    unRedeemedPositions: IPositions[]
    nextRedeemId: any
    redeemCollateralBalances: any
    isLoading: boolean
  } = useGetPoolData()
  const [isOpenUpdateOracleModal, toggleUpdateOracleModal] = useState(false)

  const collateralRedemptionDelay = useCollateralCollectionDelay()
  const deusRedemptionDelay = useDeusCollectionDelay()

  const onSwitchNetwork = useRpcChangerCallback()
  const { account } = useWeb3React()

  const [currentBlock, setCurrentBlock] = useState(Math.floor(Date.now() / 1000))
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const deusPrice = useGetDeusPrice()
  const expiredPrice = useExpiredPrice()

  const [unClaimed, setUnClaimed] = useState<IToken[]>([])
  useEffect(() => {
    setUnClaimed([])
    if (unRedeemedPositions?.length) {
      const deusTokens = unRedeemedPositions.map((position, index) => {
        const usdAmount = toBN(formatUnits(position.usdAmount.toString(), DEUS_TOKEN.decimals)).toFixed(6).toString()
        const deusPriceBN = toBN(deusPrice).div(BN_TEN.pow(DEUS_TOKEN.decimals))
        const deusAmount = toBN(usdAmount).div(deusPriceBN).toFixed(8).toString()
        const timestamp = position.timestamp.toString()
        const claimableBlock = Number(timestamp) + deusRedemptionDelay
        return {
          symbol: 'DEUS',
          index,
          claimableBlock,
          amount: Number(deusAmount),
          chainId: index % 2 === 0 ? 250 : 137,
        }
      })
      setUnClaimed((current) => [...current, ...deusTokens])
    }
  }, [
    deusPrice,
    deusRedemptionDelay,
    nextRedeemId,
    redeemCollateralBalances,
    redeemCollateralRatio,
    unRedeemedPositions,
  ])

  // const [unClaimedCollateral, setUnClaimedCollateral] = useState<IToken>()
  // useEffect(() => {
  //   setUnClaimedCollateral(undefined)
  //   if (redeemCollateralBalances && redeemCollateralBalances !== '0') {
  //     const lastRedeemTimestamp = allPositions[allPositions.length - 1].timestamp
  //     const usdcToken: IToken = {
  //       symbol: 'USDC',
  //       index: 0,
  //       claimableBlock: 5 + Number(lastRedeemTimestamp) + collateralRedemptionDelay,
  //       amount: redeemCollateralBalances,
  //     }
  //     setUnClaimedCollateral(usdcToken)
  //   }
  // }, [allPositions, collateralRedemptionDelay, redeemCollateralBalances])

  const [pendingTokens, setPendingTokens] = useState<IToken[]>([])
  const [readyCount, setReadyCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  useEffect(() => {
    setPendingTokens(
      unClaimed.filter((token) => {
        return token.claimableBlock > currentBlock
      })
    )
    const rc = unClaimed.length - pendingTokens.length
    const pc = pendingTokens.length
    setReadyCount(rc)
    setPendingCount(pc)
  }, [currentBlock, pendingTokens.length, unClaimed])

  const {
    state: CollectCollateralCallbackState,
    callback: collectCollateralCallback,
    error: collectCollateralCallbackError,
  } = useCollectCollateralCallback()

  const {
    state: CollectDeusCallbackState,
    callback: collectDeusCallback,
    error: collectDeusCallbackError,
  } = useCollectDeusCallback()

  const handleClaim = useCallback(
    async (token) => {
      console.log('called handleClaim')
      if (token.symbol === 'USDC') {
        console.log('Claim USDC')
        console.log(CollectCollateralCallbackState, collectCollateralCallbackError)
        if (!collectCollateralCallback) return
        try {
          const txHash = await collectCollateralCallback()
          console.log({ txHash })
        } catch (e) {
          if (e instanceof Error) {
          } else {
            console.error(e)
          }
        }
      } else if (token.symbol === 'DEUS') {
        console.log('Claim DEUS')
        console.log(CollectDeusCallbackState, collectDeusCallbackError)
        if (!collectDeusCallback) return
        if (expiredPrice) return toggleUpdateOracleModal(true)
        try {
          const txHash = await collectDeusCallback()
          console.log({ txHash })
        } catch (e) {
          if (e instanceof Error) console.log(e)
          else console.error(e)
        }
      }
    },
    [
      CollectCollateralCallbackState,
      CollectDeusCallbackState,
      collectCollateralCallback,
      collectCollateralCallbackError,
      collectDeusCallback,
      collectDeusCallbackError,
      expiredPrice,
    ]
  )

  return (
    <>
      <ActionWrap>
        <TitleWrap>
          <Title>Claim Bridged Tokens</Title>
        </TitleWrap>
        {!unClaimed || unClaimed.length == 0 ? (
          <ClaimBox>
            {!account ? (
              <Image
                src={!isMobile ? IC_CLAIM_NOT_CONNECTED : IC_CLAIM_NOT_CONNECTED_MOBILE}
                alt="claim_not_connected"
              />
            ) : (
              <>
                {isLoading ? (
                  <Image src={!isMobile ? IC_CLAIM_LOADING : IC_CLAIM_LOADING_MOBILE} alt="claim-loading" />
                ) : (
                  <NoTokens>
                    <Image src={CLAIM_LOGO} alt="claim" />
                    <EmptyToken> No token to claim </EmptyToken>
                  </NoTokens>
                )}
              </>
            )}
          </ClaimBox>
        ) : (
          <ClaimBox>
            <DeusBox>
              {unClaimed.map((token: IToken, index: number) => {
                return (
                  <TokenBox
                    key={index}
                    token={token}
                    currentBlock={currentBlock}
                    onSwitchNetwork={() => onSwitchNetwork(token.chainId)}
                    onClaim={() => handleClaim(token)}
                  />
                )
              })}
            </DeusBox>
          </ClaimBox>
        )}
        <InfoWrap>
          {!unClaimed || unClaimed.length == 0 ? (
            <>
              {!account ? (
                <NoResultWrapper warning> Wallet is not connected! </NoResultWrapper>
              ) : (
                <>
                  {isLoading ? (
                    <NoResultWrapper> Loading bridged tokens... </NoResultWrapper>
                  ) : (
                    <NoResultWrapper> There is no bridged token </NoResultWrapper>
                  )}
                </>
              )}
            </>
          ) : (
            <BottomInfo>
              <InfoItem name={'Ready to Claim:'} value={readyCount.toString()} />
              <InfoItem name={'Pending:'} value={pendingCount.toString()} />
            </BottomInfo>
          )}
        </InfoWrap>
      </ActionWrap>

      <UpdateModal
        title="Update Oracle"
        isOpen={isOpenUpdateOracleModal}
        buttonText={'Update Oracle'}
        toggleModal={(action: boolean) => toggleUpdateOracleModal(action)}
        handleClick={() => {
          toggleUpdateOracleModal(false)
          handleUpdatePrice()
        }}
      />
    </>
  )
}
