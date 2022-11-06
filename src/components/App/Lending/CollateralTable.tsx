import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'

import BOND_NFT_LOGO from '/public/static/images/pages/bond/BondNFT.svg'
import EMPTY_BOND from '/public/static/images/pages/bond/emptyBond.svg'
import EMPTY_BOND_MOBILE from '/public/static/images/pages/bond/emptyBondMobile.svg'
import LOADING_BOND from '/public/static/images/pages/bond/loadingBond.svg'
import LOADING_BOND_MOBILE from '/public/static/images/pages/bond/loadingBondMobile.svg'

import { BDEI_TOKEN } from 'constants/tokens'
import { DeiBonderV3, DeiBondRedeemNFT } from 'constants/addresses'

import useWeb3React from 'hooks/useWeb3'
import useApproveCallback, { ApprovalState } from 'hooks/useApproveCallback'
import { useERC721ApproveAllCallback } from 'hooks/useApproveNftCallback2'
import { LendingPoolType } from 'constants/lendingPools'

import DefaultReviewModal from './ReviewModal'
import Pagination from 'components/Pagination'
import ImageWithFallback from 'components/ImageWithFallback'
import { RowCenter } from 'components/Row'
import Column from 'components/Column'
import { PrimaryButton } from 'components/Button'
import { ButtonText } from 'pages/vest'
import { DotFlashing } from 'components/Icons'

import { DEI_TOKEN } from 'constants/tokens'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { Token } from '@sushiswap/core-sdk'

dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
`

const TableWrapper = styled.table<{ isEmpty?: boolean }>`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
  background: ${({ theme }) => theme.bg1};
  border-bottom-right-radius: ${({ isEmpty }) => (isEmpty ? '12px' : '0')};
  border-bottom-left-radius: ${({ isEmpty }) => (isEmpty ? '12px' : '0')};

  tbody > tr {
    & > * {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        &:nth-child(2),
        &:nth-child(4)  {
          display: none;
        }
      `};
    }
  }
`

const Row = styled.tr`
  align-items: center;
  height: 21px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text1};
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

const NoResults = styled.div<{ warning?: boolean }>`
  text-align: center;
  padding: 20px;
  color: ${({ theme, warning }) => (warning ? theme.warning : 'white')};
`

const NFTWrap = styled(Column)`
  margin-left: 10px;
  align-items: flex-start;
`

const PaginationWrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 100%;
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

// const CellDescription = styled.div`
//   font-size: 0.6rem;
//   color: ${({ theme }) => theme.text2};
// `

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

const ZebraStripesRow = styled(Row)<{ isEven?: boolean }>`
  background: ${({ isEven, theme }) => (isEven ? theme.bg1 : theme.bg2)};
`

const MaturityTimePassed = styled.div`
  & > * {
    color: ${({ theme }) => theme.yellow4};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: flex;
    width: 100%;
    justify-content: space-between;
  `};
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

const itemsPerPage = 10

export default function Table({
  pool,
  isMobile,
  isLoading,
}: {
  pool: LendingPoolType
  isMobile?: boolean
  isLoading: boolean
}) {
  const { account } = useWeb3React()

  const [offset, setOffset] = useState(0)
  const { collaterals } = pool

  const paginatedItems = useMemo(() => {
    return collaterals.slice(offset, offset + itemsPerPage)
  }, [collaterals, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(collaterals.length / itemsPerPage)
  }, [collaterals])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <>
      <Wrapper>
        <TableWrapper isEmpty={paginatedItems.length === 0}>
          <tbody>
            {paginatedItems.length > 0 &&
              paginatedItems.map((token: Token, index) => (
                <TableRow key={index} index={index} token={token} isMobile={isMobile} />
              ))}
          </tbody>
          {paginatedItems.length === 0 && (
            <tbody>
              <tr>
                <td>
                  <div style={{ margin: '0 auto' }}>
                    {isLoading ? (
                      <Image src={isMobile ? LOADING_BOND_MOBILE : LOADING_BOND} alt="loading-bond" />
                    ) : (
                      <Image src={isMobile ? EMPTY_BOND_MOBILE : EMPTY_BOND} alt="empty-bond" />
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  {!account ? (
                    <NoResults warning>Wallet is not connected!</NoResults>
                  ) : isLoading ? (
                    <NoResults>Loading...</NoResults>
                  ) : (
                    <NoResults>No DEI bond NFT found</NoResults>
                  )}
                </td>
              </tr>
            </tbody>
          )}
        </TableWrapper>
        <PaginationWrapper>
          {paginatedItems.length > 0 && (
            <Pagination count={collaterals.length} pageCount={pageCount} onPageChange={onPageChange} />
          )}
        </PaginationWrapper>
      </Wrapper>
    </>
  )
}

function TableRow({ token, index, isMobile }: { token: Token; index: number; isMobile?: boolean }) {
  const { chainId } = useWeb3React()
  const logo = useCurrencyLogo((token as Token)?.address)

  const insufficientBalance = false
  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)
  const [awaitingMigrateConfirmation, setAwaitingMigrateConfirmation] = useState<boolean>(false)
  const [isOpenReviewModal, toggleReviewModal] = useState(false)

  const bDEICurrency = BDEI_TOKEN
  const spender = useMemo(() => (chainId ? DeiBonderV3[chainId] : undefined), [chainId])
  const [approvalStateCurrency, approveCallbackCurrency] = useApproveCallback(bDEICurrency ?? undefined, spender)

  const showApproveCurrency = useMemo(
    () => bDEICurrency && approvalStateCurrency !== ApprovalState.APPROVED,
    [bDEICurrency, approvalStateCurrency]
  )

  // subtracting 10 seconds to mitigate this from being true on page load
  // const lockHasEnded = useMemo(() => dayjs.utc(redeemTime).isBefore(dayjs.utc().subtract(10, 'seconds')), [redeemTime])

  const handleApproveCurrency = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallbackCurrency()
    setAwaitingApproveConfirmation(false)
  }

  const [approvalState, approveCallback] = useERC721ApproveAllCallback(
    chainId ? DeiBondRedeemNFT[chainId] : undefined,
    spender
  )

  const showApproveNFT = useMemo(() => approvalState !== ApprovalState.APPROVED, [approvalState])

  const handleApproveNFT = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  const info = useMemo(
    () => [
      { title: 'Max Slippage', value: '10 %' },
      { title: 'Txn Deadline', value: '20 min' },
      { title: 'Network Fee', value: 'N/A' },
    ],
    []
  )

  // const claimableAmount = toBN(nft_data.filter((nft) => nft.tokenId == tokenId)[0].amount).div(1e18)

  // const { bDeiBalance } = useUserBondStats()
  // const claimAmount = bDeiBalance && bDeiBalance.gt(claimableAmount) ? claimableAmount : bDeiBalance
  // const { callback: migrateCallback } = useMigrateNftToDeiCallback(tokenId, claimAmount)

  // const handleMigrate = useCallback(async () => {
  //   if (!migrateCallback) return
  //   try {
  //     setAwaitingMigrateConfirmation(true)
  //     const txHash = await migrateCallback()
  //     setAwaitingMigrateConfirmation(false)
  //     console.log({ txHash })
  //   } catch (e) {
  //     setAwaitingMigrateConfirmation(false)
  //     if (e instanceof Error) {
  //       console.error(e)
  //     } else {
  //       console.error(e)
  //     }
  //   }
  // }, [migrateCallback])

  function getApproveButton(): JSX.Element | null {
    // if (!lockHasEnded) {
    //   const dayMsg = day == 0 ? 'today' : day + ' day'
    //   return (
    //     <RedeemButton disabled>
    //       <ButtonText>{`Redeem in ${dayMsg ?? '-'}${day && day > 1 ? 's' : ''}`}</ButtonText>
    //     </RedeemButton>
    //   )
    // }
    if (awaitingApproveConfirmation) {
      return (
        <RedeemButton disabled={true}>
          <ButtonText>
            Awaiting Confirmation <DotFlashing />
          </ButtonText>
        </RedeemButton>
      )
    }

    if (showApproveCurrency)
      return (
        <RedeemButton onClick={() => handleApproveCurrency()}>
          <ButtonText>Approve bDEI</ButtonText>
        </RedeemButton>
      )

    if (showApproveNFT)
      return (
        <RedeemButton onClick={() => handleApproveNFT()}>
          <ButtonText>Approve NFT</ButtonText>
        </RedeemButton>
      )

    return null
  }

  function getActionButton(): JSX.Element | null {
    if (insufficientBalance)
      return (
        <RedeemButton disabled>
          <ButtonText>insufficient bDEI Balance</ButtonText>
        </RedeemButton>
      )
    if (awaitingMigrateConfirmation) {
      return (
        <RedeemButton disabled>
          <ButtonText>
            Redeem <DotFlashing />
          </ButtonText>
        </RedeemButton>
      )
    }
    return (
      <RedeemButton onClick={() => toggleReviewModal(true)}>
        <ButtonText>{'Redeem bDEI'}</ButtonText>
      </RedeemButton>
    )
  }

  // function getMaturityTimeCell() {
  //   if (!lockHasEnded)
  //     return (
  //       <>
  //         <Name>Maturity Time</Name>
  //         <Value>{dayjs.utc(redeemTime).format('LLL')}</Value>
  //       </>
  //     )
  //   return (
  //     <MaturityTimePassed>
  //       <Name>Expired in</Name>
  //       <Value>{dayjs.utc(redeemTime).format('LLL')}</Value>
  //     </MaturityTimePassed>
  //   )
  // }

  function getTableRow() {
    return (
      <>
        <Cell>
          <RowCenter>
            <ImageWithFallback src={logo} alt={`Bond logo`} width={30} height={30} />
            {/* <Name>{name}</Name> */}

            <NFTWrap>
              <CellAmount>{token.name}</CellAmount>
            </NFTWrap>
          </RowCenter>
        </Cell>

        <Cell>
          <Name>APR/TVL</Name>
          {/* <Value>{formatBalance(parseFloat(deiAmount ? deiAmount.toString() : ''), 8)} bDEI</Value> */}
          <Value>23</Value>
        </Cell>

        <Cell>
          <Name>Balance</Name>
          {/* <Value>{formatBalance(claimableAmount, 8)} DEI</Value> */}
          <Value>12</Value>
        </Cell>

        {/* <Cell style={{ padding: '5px 10px' }}>{getMaturityTimeCell()}</Cell> */}

        {/* <Cell style={{ padding: '5px 10px' }}>{getApproveButton() ?? getActionButton()}</Cell> */}
        <Cell style={{ padding: '5px 10px' }}>
          <Name>Liquidity</Name>
          {/* <Value>{formatBalance(claimableAmount, 8)} DEI</Value> */}
          <Value>43.2k</Value>
        </Cell>
        {getReviewModal()}
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
              <CellAmount>DEI Bond </CellAmount>
            </NFTWrap>
          </RowCenter>

          <RowCenter style={{ padding: '5px 10px' }}>
            <RedeemButton disabled={true ? true : false} onClick={() => toggleReviewModal(true)}>
              <ButtonText>{true ? `Redeem in 2 days` : 'Redeem bDEI'}</ButtonText>
            </RedeemButton>
          </RowCenter>
        </FirstRow>

        <MobileCell>
          <Name>Bond Value</Name>
          <Value>4 bDEI</Value>
        </MobileCell>

        {/* <MobileCell>
          <Name>Claimable DEI</Name>
          <Value>{'N/A'}</Value>
        </MobileCell> */}

        {/* <MobileCell>{getMaturityTimeCell()}</MobileCell> */}
        {getReviewModal()}
      </MobileWrapper>
    )
  }

  function getReviewModal() {
    // const amount = claimAmount?.toString() ?? '0.0'
    const amount = '0.0'
    return (
      <DefaultReviewModal
        title="Review Transaction"
        isOpen={isOpenReviewModal}
        toggleModal={(action: boolean) => toggleReviewModal(action)}
        inputTokens={[BDEI_TOKEN]}
        outputTokens={[DEI_TOKEN]}
        amountsIn={[amount]}
        amountsOut={[amount]}
        tokenId={3}
        info={info}
        data={''}
        buttonText={'Confirm'}
        awaiting={awaitingMigrateConfirmation}
        summary={`Redeem DEI Bond #23 & ${amount} bDEI for ${amount} DEI`}
        handleClick={() => console.log('')}
      />
    )
  }

  return <ZebraStripesRow isEven={index % 2 === 0}>{isMobile ? getTableRowMobile() : getTableRow()}</ZebraStripesRow>
}
