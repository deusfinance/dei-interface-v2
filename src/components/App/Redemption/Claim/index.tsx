import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import CLAIM_LOGO from '/public/static/images/pages/redemption/claim.svg'

import { Card } from 'components/Card'
import { Row, RowBetween } from 'components/Row'
import { TokenBox } from './TokenBox'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { SupportedChainId } from 'constants/chains'
import InfoItem from 'components/App/StableCoin/InfoItem'
import { useGetPoolData } from 'hooks/useRedemptionPage'
import { DEUS_TOKEN } from 'constants/tokens'
import { formatUnits } from '@ethersproject/units'
import { toBN } from 'utils/numbers'

const ActionWrap = styled(Card)`
  background: ${({ theme }) => theme.bg2};
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

const TitleWrap = styled(RowBetween)`
  border-bottom: 1px solid ${({ theme }) => theme.bg2};
  width: 100%;
`

const Title = styled.div`
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  font-size: 16px;
  margin-top: 12px;
  margin-left: 16px;
  margin-bottom: 12px;
`

export const ClaimBox = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  overflow: hidden;
  overflow-y: auto;
  & > div {
    padding: 15px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.bg2};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-height: 180px;
    overflow: auto;
    // overflow-x: hidden;
  `}
`

export const BottomRow = styled(Row)`
  flex-wrap: wrap;
  padding: 10px 10px;
  /* align-items: flex-end; */
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

const EmptyToken = styled.p`
  margin-top: 0.75rem;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.text4};
  margin-bottom: 1rem;
`
const InfoWrap = styled.div`
  background: ${({ theme }) => theme.bg1};
  padding: 0 15px 10px 15px;
  width: 100%;
`

export const collateralRedemptionDelay = 30 + 5 // in seconds
export const deusRedemptionDelay = 8 * 60 * 60 + 5 // in seconds

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
    nextRedeemId,
    redeemCollateralBalances,
  }: { allPositions: IPositions[]; nextRedeemId: any; redeemCollateralBalances: any } = useGetPoolData()

  const onSwitchNetwork = useRpcChangerCallback()

  const [currentBlock, setCurrentBlock] = useState(Math.floor(Date.now() / 1000))
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const [unClaimed, setUnClaimed] = useState<IToken[]>([])
  useEffect(() => {
    if (allPositions?.length) {
      if (redeemCollateralBalances) {
        const lastRedeemTimestamp = allPositions[allPositions.length - 1].timestamp
        const usdcToken: IToken = {
          symbol: 'USDC',
          index: 0,
          claimableBlock: Number(lastRedeemTimestamp) + collateralRedemptionDelay,
          amount: redeemCollateralBalances,
        }
        setUnClaimed([usdcToken])
      }

      const deusTokens = allPositions.map((position, index) => {
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
  }, [allPositions, redeemCollateralBalances, redeemCollateralRatio])

  const pendingTokens = unClaimed.filter((token) => {
    return token.claimableBlock > currentBlock
  })

  // TODO: add claim functions
  const handleClaim = useCallback(
    (token) => {
      if (token.symbol === 'USDC') {
        console.log('Claim USDC')
        return
      } else if (token.symbol === 'DEUS' && token.index == nextRedeemId) {
        console.log('Claim DEUS')
        return
      } else {
        console.log('Please claim the first redeemed DEUS first')
        return
      }
    },
    [nextRedeemId]
  )

  return (
    <ActionWrap>
      <TitleWrap>
        <Title>Claim tokens</Title>
      </TitleWrap>
      {!unClaimed || unClaimed.length == 0 ? (
        <ClaimBox style={{ justifyContent: 'center', margin: '1rem' }}>
          <Image src={CLAIM_LOGO} alt="claim" />
          <EmptyToken> nothing to claim </EmptyToken>
        </ClaimBox>
      ) : (
        <>
          <ClaimBox>
            {unClaimed.map((token: IToken, index: number) => {
              const { symbol, amount, claimableBlock } = token
              const toChainId = SupportedChainId.FANTOM
              return (
                <TokenBox
                  key={index}
                  symbol={symbol}
                  claimableBlock={claimableBlock}
                  currentBlock={currentBlock}
                  amount={amount}
                  onSwitchNetwork={() => onSwitchNetwork(toChainId)}
                  onClaim={() => handleClaim(token)}
                />
              )
            })}
          </ClaimBox>
          <InfoWrap>
            <InfoItem name={'Ready to Claim:'} value={(unClaimed.length - pendingTokens.length).toString()} />
            <InfoItem name={'Pending:'} value={pendingTokens.length.toString()} />
          </InfoWrap>
        </>
      )}
      {/* {unClaimed.length > 0 && <BottomRow>{getInfoComponent()}</BottomRow>} */}
    </ActionWrap>
  )
}
