import React, { useState } from 'react'
import styled from 'styled-components'
import { Token } from '@sushiswap/core-sdk'

import { ModalHeader, Modal } from 'components/Modal'

import Column from 'components/Column'
import { Row, RowCenter } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import InputBox from 'components/InputBox'
import LottieDei from 'components/Icons/LottieDei'
import ModalInfo from './ModalInfo'

const MainModal = styled(Modal)`
  display: flex;
  width: 440px;
  justify-content: center;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 24px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 90%;
    max-height: 560px;
  `};
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  margin: 0 15px;
  gap: 0.8rem;
  padding: 1.5rem 0;
  overflow-y: scroll;
  height: auto;
`

const AwaitingWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 1.5rem 0;
`

const LottieWrap = styled.div`
  margin-bottom: 30px;
`

const SummaryWrap = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  margin: 20px auto;
  max-width: 350px;
  text-align: center;
`

const ConfirmWrap = styled(SummaryWrap)`
  font-size: 14px;
  margin: 0;
  margin-top: 20px;
`

const TokenResultWrapper = styled(Column)`
  gap: 8px;
  padding-top: 1rem;
`

const Data = styled(RowCenter)`
  font-style: italic;
  font-weight: 300;
  font-size: 12px;
  line-height: 14px;
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`
const ConfirmButton = styled(PrimaryButton)`
  height: 62px;
  max-width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
  border-radius: 12px;
`

const Separator = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border2};
`

const SeparatorLight = styled.div`
  height: 2px;
  background: ${({ theme }) => theme.bg2};
  margin-top: 30px;
`

const DeiBondWrap = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};
  padding: 15px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
  `}
`

const NFTWrap = styled(Row)`
  margin-left: 10px;
  align-items: flex-start;
  cursor: pointer;
`

const CellAmount = styled.div`
  font-size: 20px;
  background: ${({ theme }) => theme.deiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 0.95rem;
  `};
`

const Item = styled.div<{ active?: boolean }>`
  width: 50%;
  height: 100%;
  text-align: center;
  /* border-bottom: 1px solid ${({ theme }) => theme.white}; */
  border-bottom: ${({ active, theme }) => active && `1px solid ${theme.white}`};
  cursor: pointer;
`

export default function DefaultReviewModal({
  title,
  inputTokens,
  outputTokens,
  amountsIn,
  amountsOut,
  isOpen,
  data,
  tokenId,
  buttonText,
  toggleModal,
  handleClick,
  awaiting,
  summary,
  info,
}: {
  title: string
  inputTokens: Token[]
  outputTokens: Token[]
  amountsIn: string[]
  amountsOut: string[]
  isOpen: boolean
  data: string | null
  tokenId: number
  buttonText: string
  toggleModal: (action: boolean) => void
  handleClick: () => void
  awaiting: boolean
  summary: string
  info: { title: string; value: string }[]
}) {
  const [mode, setMode] = useState(0)
  const [amount, setAmount] = useState('')
  function onClickItem(mode: number) {
    setMode(mode)
  }
  return (
    <MainModal isOpen={isOpen} onBackgroundClick={() => toggleModal(false)} onEscapeKeydown={() => toggleModal(false)}>
      <ModalHeader onClose={() => toggleModal(false)} title={awaiting ? 'Confirmation' : title} border={false} />
      {awaiting ? (
        <AwaitingWrapper>
          <LottieWrap>
            <LottieDei />
          </LottieWrap>

          <RowCenter>
            <span>Waiting for confirmation...</span>
          </RowCenter>

          <RowCenter>
            <SummaryWrap>{summary}</SummaryWrap>
          </RowCenter>

          <SeparatorLight />

          <RowCenter>
            <ConfirmWrap>Confirm this transaction in your wallet</ConfirmWrap>
          </RowCenter>
        </AwaitingWrapper>
      ) : (
        <Wrapper>
          <TokenResultWrapper>
            <DeiBondWrap>
              {/* <ImageWithFallback src={BOND_NFT_LOGO} alt={`Bond logo`} width={getImageSize()} height={getImageSize()} /> */}
              <NFTWrap>
                {/* <CellAmount>DEI Bond #{tokenId}</CellAmount> */}
                <Item active={mode === 0} onClick={() => onClickItem(0)}>
                  Borrow
                </Item>
                <Item active={mode === 1} onClick={() => onClickItem(1)}>
                  Repay
                </Item>
              </NFTWrap>
            </DeiBondWrap>
            <InputBox
              currency={inputTokens[0]}
              value={amount}
              onChange={(value: string) => setAmount(value)}
              disabled={false}
            />
            <ModalInfo info={info} />
          </TokenResultWrapper>
          {data && (
            <>
              <Separator />
              <Data>{data}</Data>
            </>
          )}
        </Wrapper>
      )}

      {!awaiting && <ConfirmButton onClick={() => handleClick()}>{buttonText}</ConfirmButton>}
    </MainModal>
  )
}
