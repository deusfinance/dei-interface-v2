import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import CLAIM_LOGO from '/public/static/images/pages/redemption/claim.svg'

import { Card } from 'components/Card'
import { Row, RowBetween } from 'components/Row'
import { TokenBox } from './TokenBox'
import { IClaimToken, setAttemptingTxn } from 'state/redeem/reducer'
import { useClaimableTokens } from 'state/redeem/hooks'
// import { useClaimCallback } from 'hooks/useBridgeCallback'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useAppDispatch } from 'state'
import { SupportedChainId } from 'constants/chains'

const ActionWrap = styled(Card)`
  padding: 0;
  max-height: 100%;
  box-shadow: ${({ theme }) => theme.boxShadow2};
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 12px;
  max-width: 320px;
  width: 320px;
  min-height: 370px;
  min-width: 220px;
  margin-top: 28px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 20px auto;
  `}
`
const TitleWrap = styled(RowBetween)`
  border-bottom: 1px solid ${({ theme }) => theme.bg2};
  width: 100%;
`

const Title = styled.div`
  color: ${({ theme }) => theme.text1};
  font-family: 'IBM Plex Mono';
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
`

export const BottomRow = styled(Row)`
  flex-wrap: wrap;
  padding: 10px 10px;
  /* align-items: flex-end; */
  position: relative;
  background: ${({ theme }) => theme.bg2};
  margin-bottom: auto;
`

const BottomWrap = styled.div`
  text-align: center;
  /* vertical-align: bottom; */
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
`

const getInfoComponent = (): JSX.Element => {
  return (
    <BottomWrap>
      <InfoHeader>Change to the destination Network</InfoHeader>
      <InfoSubHeader>to claim your token on respective networks.</InfoSubHeader>
    </BottomWrap>
  )
}

export default function RedeemClaim() {
  const unClaimed = useClaimableTokens()
  // const currentBlocks = useCurrentBlocks()
  const currentBlock = Date.now() / 1000
  const dispatch = useAppDispatch()
  const onSwitchNetwork = useRpcChangerCallback()

  const [token, setToken] = useState<IClaimToken | null>(null)
  // const { state: claimCallbackState, callback: claimCallback, error: claimCallbackError } = useClaimCallback()

  const handleClaim = useCallback(
    async (token: IClaimToken | null) => {
      // console.log('called handleClaim')
      // console.log(claimCallbackState, claimCallback, claimCallbackError)

      // if (!claimCallback) return
      dispatch(setAttemptingTxn(true))

      let error = ''
      try {
        // const txHash = await claimCallback(token)
        // setTxHash(txHash)
      } catch (e) {
        if (e instanceof Error) {
          error = e.message
        } else {
          console.error(e)
          error = 'An unknown error occurred.'
        }
      }
    },
    [dispatch]
  )

  return (
    <ActionWrap>
      <TitleWrap>
        <Title>Claim tokens</Title>
      </TitleWrap>
      {!unClaimed || unClaimed.length == 0 ? (
        <ClaimBox style={{ justifyContent: 'center' }}>
          <Image src={CLAIM_LOGO} alt="claim" />
          <EmptyToken> - nothing to claim -</EmptyToken>
        </ClaimBox>
      ) : (
        <ClaimBox>
          {unClaimed.map((token: IClaimToken, index: number) => {
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
      )}
      {/* {unClaimed.length > 0 && <BottomRow>{getInfoComponent()}</BottomRow>} */}
    </ActionWrap>
  )
}
