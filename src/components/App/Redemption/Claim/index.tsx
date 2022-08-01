import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import CLAIM_LOGO from '/public/static/images/pages/redemption/claim.svg'

import { Card } from 'components/Card'
import { Row, RowBetween } from 'components/Row'
import { TokenBox } from './TokenBox'
import { IClaimToken, setAttemptingTxn } from 'state/redeem/reducer'
import { useClaimableTokens } from 'state/redeem/hooks'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useAppDispatch } from 'state'
import { SupportedChainId } from 'constants/chains'
import InfoItem from 'components/App/StableCoin/InfoItem'

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
`
const InfoWrap = styled.div`
  background: ${({ theme }) => theme.bg1};
  padding: 0 15px 10px 15px;
  width: 100%;
`

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
          <EmptyToken> nothing to claim </EmptyToken>
        </ClaimBox>
      ) : (
        <>
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
          <InfoWrap>
            <InfoItem name={'Ready to Claim:'} value={'2'} />
            <InfoItem name={'Pending:'} value={'4'} />
          </InfoWrap>
        </>
      )}
      {/* {unClaimed.length > 0 && <BottomRow>{getInfoComponent()}</BottomRow>} */}
    </ActionWrap>
  )
}
