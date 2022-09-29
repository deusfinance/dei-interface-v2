import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'

import BOND_NFT_LOGO from '/public/static/images/tokens/bdei.svg'

// import useWeb3React from 'hooks/useWeb3'
import { BN_ZERO, formatBalance, toBN } from 'utils/numbers'

import { ButtonText } from 'pages/vest'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButton } from 'components/Button'
import { InputWrapper, NumericalInput } from 'components/Input'
import BigNumber from 'bignumber.js'
import { useClaimDEICallback } from 'hooks/useBondsCallback'
import { useUserBondStats } from 'hooks/useBondsPage'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1168px);
`

const TableWrapper = styled.table<{ isEmpty?: boolean }>`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  tbody {
    & > * {
      &:nth-child(4) {
        width: 250px;
      }
      ${({ theme }) => theme.mediaWidth.upToSmall`
        &:nth-child(2),
        &:nth-child(3) {
          display: none;
        }
        &:nth-child(4) {
          width: 220px;
        }
      `};
    }
  }
`

const FirstRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 5px;
`

const Cell = styled.td<{
  justify?: boolean
}>`
  align-items: center;
  padding: 5px;
  height: 90px;
`

const NFTWrap = styled(Column)`
  margin-left: 10px;
  align-items: flex-start;
`

const CellAmount = styled.div`
  font-size: 0.85rem;
  background: ${({ theme }) => theme.deiColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 0.95rem;
  `};
`

const Name = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 12px;
  `};
`

const Value = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
`

const MobileCell = styled.div`
  display: flex;
  justify-content: space-between;
  width: 95%;
  margin-left: 10px;
`

const MobileWrapper = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
`

const MaxButton = styled.div`
  position: absolute;
  right: 25px;
  top: 35px;
  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

const RedeemButton = styled(PrimaryButton)`
  border-radius: 8px;

  ${({ theme, disabled }) =>
    disabled &&
    `
      background: ${theme.border3};
      border: 1px solid ${theme.border1};
      cursor:default;

      &:focus,
      &:hover {
        background: ${theme.border3};
      }
  `}
`

export default function Table({ remainingDEI, isMobile }: { remainingDEI: BigNumber; isMobile?: boolean }) {
  return (
    <>
      <Wrapper>
        <TableWrapper isEmpty={false}>
          <tbody>
            <TableRow remainingDEI={remainingDEI} isMobile={isMobile} />
          </tbody>
        </TableWrapper>
      </Wrapper>
    </>
  )
}

function TableRow({ remainingDEI, isMobile }: { remainingDEI: BigNumber; isMobile?: boolean }) {
  const [amountIn, setAmountIn] = useState('')
  const amountInBN = toBN(amountIn)
  const { callback: claimCallback } = useClaimDEICallback(amountInBN)
  const { bDeiBalance } = useUserBondStats()
  const maxAmount = useMemo(
    () => (bDeiBalance ? (bDeiBalance.gt(remainingDEI) ? remainingDEI : bDeiBalance) : BN_ZERO),
    [remainingDEI, bDeiBalance]
  )

  const handleClaim = useCallback(async () => {
    if (!claimCallback) return
    if (!amountIn || Number(amountIn) == 0) {
      toast.error('Please enter amount')
    }
    try {
      const txHash = await claimCallback()
      console.log({ txHash })
    } catch (e) {
      console.error(e)
    }
  }, [claimCallback, amountIn])

  function getMaturityTimeCell() {
    return (
      <>
        <Name>Claimable DEI</Name>
        <Value>{formatBalance(remainingDEI ?? '')}</Value>
      </>
    )
  }

  function getTableRow() {
    return (
      <>
        <Cell>
          <RowCenter>
            <ImageWithFallback src={BOND_NFT_LOGO} alt={`Bond logo`} width={35} height={35} />
            <NFTWrap>
              <CellAmount>Remaining bDEI</CellAmount>
            </NFTWrap>
          </RowCenter>
        </Cell>

        <Cell>
          <Name>Remaining bDEI</Name>
          <Value>{formatBalance(remainingDEI ?? '')} bDEI</Value>
        </Cell>

        <Cell style={{ padding: '5px 10px' }}>{getMaturityTimeCell()}</Cell>

        <Cell style={{ padding: '5px 10px', position: 'relative' }}>
          <MaxButton
            onClick={() => {
              setAmountIn(maxAmount.toString())
            }}
          >
            Max
          </MaxButton>
          <InputWrapper>
            <NumericalInput
              autoFocus
              value={amountIn}
              onUserInput={setAmountIn}
              placeholder="Enter Amount"
              style={{ marginLeft: '-4px', fontSize: '16px' }}
            />
          </InputWrapper>
        </Cell>

        <Cell style={{ padding: '5px 10px' }}>
          <RedeemButton onClick={() => handleClaim()}>
            <ButtonText>Redeem bDEI</ButtonText>
          </RedeemButton>
        </Cell>
      </>
    )
  }

  function getTableRowMobile() {
    return (
      <MobileWrapper>
        <FirstRow>
          <RowCenter>
            <ImageWithFallback src={BOND_NFT_LOGO} alt={`Bond logo`} width={30} height={30} />
            <NFTWrap>
              <CellAmount>Remaining bDEI</CellAmount>
            </NFTWrap>
          </RowCenter>

          <RowCenter style={{ padding: '5px 10px' }}>
            <RedeemButton onClick={() => console.log('')}>
              <ButtonText>Redeem BDEI</ButtonText>
            </RedeemButton>
          </RowCenter>
        </FirstRow>

        <MobileCell>
          <Name>Bond Value</Name>
          <Value>{formatBalance(remainingDEI ?? '')} bDEI</Value>
        </MobileCell>

        <MobileCell>{getMaturityTimeCell()}</MobileCell>
      </MobileWrapper>
    )
  }

  return isMobile ? getTableRowMobile() : getTableRow()
}
