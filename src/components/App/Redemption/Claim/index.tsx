import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'

import IC_CLAIM_EMPTY from '/public/static/images/pages/redemption/ic_claim_empty.svg'
import IC_CLAIM_LOADING from '/public/static/images/pages/redemption/ic_claim_loading.svg'
import IC_CLAIM_NOTCONNECTED from '/public/static/images/pages/redemption/ic_claim_notconnected.svg'

import IC_CLAIM_EMPTY_MOBILE from '/public/static/images/pages/redemption/ic_claim_empty_mobile.svg'
import IC_CLAIM_LOADING_MOBILE from '/public/static/images/pages/redemption/ic_claim_loading_mobile.svg'
import IC_CLAIM_NOTCONNECTED_MOBILE from '/public/static/images/pages/redemption/ic_claim_notconnected_mobile.svg'

import { Card } from 'components/Card'
import { Row } from 'components/Row'
import { TokenBox } from './TokenBox'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { SupportedChainId } from 'constants/chains'
import { useGetPoolData } from 'hooks/useRedemptionPage'
import { DEUS_TOKEN } from 'constants/tokens'
import { formatUnits } from '@ethersproject/units'
import { toBN } from 'utils/numbers'
import { useCollectCollateralCallback, useCollectDeusCallback } from 'hooks/useRedemptionCallback'
import useWeb3React from 'hooks/useWeb3'

const ActionWrap = styled(Card)`
  background: transparent;
  border-radius: 12px;
  margin-top: 28px;
  width: 320px;
  padding: 2px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 20px auto;
    margin-bottom: 0;
    width: 90%;
  `};
`

export const ClaimBox = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
`

const DeusBox = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
`

const UsdcBox = styled.div`
  margin-bottom: 12px;
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

export const collateralRedemptionDelay = 30 + 5 // in seconds
export const deusRedemptionDelay = 8 * 60 * 60 + 5 // in seconds
// export const deusRedemptionDelay = 20 + 5 // for test only

interface IPositions {
  usdAmount: string
  timestamp: string
}
interface IToken {
  symbol: string
  index: number
  claimableBlock: number
  amount: number
}

export default function RedeemClaim({ redeemCollateralRatio }: { redeemCollateralRatio: string }) {
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

  const onSwitchNetwork = useRpcChangerCallback()
  const { account } = useWeb3React()

  const [currentBlock, setCurrentBlock] = useState(Math.floor(Date.now() / 1000))
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const [unClaimed, setUnClaimed] = useState<IToken[]>([])
  useEffect(() => {
    setUnClaimed([])
    if (unRedeemedPositions?.length) {
      const deusTokens = unRedeemedPositions.map((position, index) => {
        const usdAmount = position.usdAmount.toString()
        const timestamp = position.timestamp.toString()
        const deusAmount = toBN(formatUnits(usdAmount, DEUS_TOKEN.decimals))
          .times(100 - Number(redeemCollateralRatio))
          .toString()
        const claimableBlock = Number(timestamp) + deusRedemptionDelay
        return {
          symbol: 'DEUS',
          index,
          claimableBlock,
          amount: Number(deusAmount),
        }
      })
      setUnClaimed((current) => [...current, ...deusTokens])
    }
  }, [nextRedeemId, redeemCollateralBalances, redeemCollateralRatio, unRedeemedPositions])

  const [unClaimedCollateral, setUnClaimedCollateral] = useState<IToken>()
  useEffect(() => {
    setUnClaimedCollateral(undefined)
    if (redeemCollateralBalances && redeemCollateralBalances !== '0') {
      const lastRedeemTimestamp = allPositions[allPositions.length - 1].timestamp
      const usdcToken: IToken = {
        symbol: 'USDC',
        index: 0,
        claimableBlock: Number(lastRedeemTimestamp) + collateralRedemptionDelay,
        amount: redeemCollateralBalances,
      }
      setUnClaimedCollateral(usdcToken)
    }
  }, [allPositions, redeemCollateralBalances])

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
    ]
  )

  return (
    <ActionWrap>
      {!unClaimed || unClaimed.length == 0 ? (
        <>
          {!account ? (
            <Image src={!isMobile ? IC_CLAIM_NOTCONNECTED : IC_CLAIM_NOTCONNECTED_MOBILE} alt="claim-notconnected" />
          ) : (
            <>
              {isLoading ? (
                <Image src={!isMobile ? IC_CLAIM_LOADING : IC_CLAIM_LOADING_MOBILE} alt="claim-loading" />
              ) : (
                <Image src={!isMobile ? IC_CLAIM_EMPTY : IC_CLAIM_EMPTY_MOBILE} alt="claim-empty" />
              )}
            </>
          )}
        </>
      ) : (
        <ClaimBox>
          {unClaimedCollateral && (
            <UsdcBox>
              <TokenBox
                symbol={unClaimedCollateral.symbol}
                claimableBlock={unClaimedCollateral.claimableBlock}
                currentBlock={currentBlock}
                amount={unClaimedCollateral.amount}
                onSwitchNetwork={() => onSwitchNetwork(SupportedChainId.FANTOM)}
                onClaim={() => handleClaim(unClaimedCollateral)}
              />
            </UsdcBox>
          )}
          <DeusBox>
            {unClaimed.map((token: IToken, index: number) => {
              const { symbol, amount, claimableBlock } = token
              return (
                <TokenBox
                  key={index}
                  symbol={symbol}
                  claimableBlock={claimableBlock}
                  currentBlock={currentBlock}
                  amount={amount}
                  onSwitchNetwork={() => onSwitchNetwork(SupportedChainId.FANTOM)}
                  onClaim={() => handleClaim(token)}
                  isFirst={index === 0}
                  isLast={index === unClaimed.length - 1}
                />
              )
            })}
          </DeusBox>
        </ClaimBox>
      )}
    </ActionWrap>
  )
}
