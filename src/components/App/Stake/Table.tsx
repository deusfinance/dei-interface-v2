import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
// import toast from 'react-hot-toast'

// import { useVeDeusContract } from 'hooks/useContract'
// import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
// import { useVestedInformation } from 'hooks/useVested'
// import { useVeDistContract } from 'hooks/useContract'

import Pagination from 'components/Pagination'
// import ImageWithFallback from 'components/ImageWithFallback'
// import { RowCenter } from 'components/Row'
import { PrimaryButtonWide } from 'components/Button'
// import { DotFlashing } from 'components/Icons'

// import DEUS_LOGO from '/public/static/images/tokens/deus.svg'
import EMPTY_LOCK from '/public/static/images/pages/veDEUS/emptyLock.svg'
import EMPTY_LOCK_MOBILE from '/public/static/images/pages/veDEUS/emptyLockMobile.svg'
import LOADING_LOCK from '/public/static/images/pages/veDEUS/loadingLock.svg'
import LOADING_LOCK_MOBILE from '/public/static/images/pages/veDEUS/loadingLockMobile.svg'

// import { formatAmount } from 'utils/numbers'
// import { DefaultHandlerError } from 'utils/parseError'
import useWeb3React from 'hooks/useWeb3'
import { LiquidityPool, StakingType, StakingVersion } from 'constants/stakingPools'

import TokenBox from 'components/App/Stake/TokenBox'
import RewardBox from 'components/App/Stake/RewardBox'
import { useRouter } from 'next/router'
import { ExternalLink } from 'components/Link'
import { Divider, HStack, VStack } from '../Staking/common/Layout'
import Spooky from '/public/static/images/pages/stake/spooky.svg'
import Beethoven from '/public/static/images/pages/stake/beethoven.svg'
import ExternalIcon from '/public/static/images/pages/stake/down.svg'

import { Token } from '@sushiswap/core-sdk'
import { useDeiPrice, useDeusPrice } from 'hooks/useCoingeckoPrice'
import { usePoolBalances } from 'hooks/useStablePoolInfo'
import { formatDollarAmount } from 'utils/numbers'
import { FALLBACK_CHAIN_ID, SupportedChainId } from 'constants/chains'
import { useBDeiStats } from 'hooks/useBDeiStats'
import { useUserInfo } from 'hooks/useStakingInfo'
import { useVDeusStats } from 'hooks/useVDeusStats'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useWalletModalToggle } from 'state/application/hooks'

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

export const Cell = styled.td<{ justify?: boolean }>`
  align-items: center;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  height: 90px;
`

const NoResults = styled.div<{ warning?: boolean }>`
  text-align: center;
  padding: 20px;
  color: ${({ theme, warning }) => (warning ? theme.warning : 'white')};
`

const PaginationWrapper = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 100%;
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

const ZebraStripesRow = styled(Row)<{ isEven?: boolean }>`
  background: ${({ theme }) => theme.bg1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    background:none;
  `};
`

const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}

  ${({ gradientText }) =>
    gradientText &&
    `
    background: -webkit-linear-gradient(92.33deg, #e29d52 -10.26%, #de4a7b 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

const TopBorderWrap = styled.div<{ active?: boolean }>`
  background: ${({ theme, active }) => (active ? theme.primary2 : theme.white)};
  padding: 2px;
  border-radius: 12px;
  margin-right: 4px;
  margin-left: 3px;
  border: 1px solid ${({ theme }) => theme.bg0};
  flex: 1;

  &:hover {
    border: 1px solid ${({ theme, active }) => (active ? theme.bg0 : theme.warning)};
  }
`

export const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 8px;
  height: 100%;
  width: 100%;
  display: flex;
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

const itemsPerPage = 10

export default function Table({ isMobile, stakings }: { isMobile?: boolean; stakings: StakingType[] }) {
  const [offset, setOffset] = useState(0)
  const { account } = useWeb3React()

  const paginatedItems = useMemo(() => {
    return stakings.slice(offset, offset + itemsPerPage)
  }, [stakings, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(stakings.length / itemsPerPage)
  }, [stakings])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  const isLoading = false

  return (
    <Wrapper>
      <TableWrapper isEmpty={paginatedItems.length === 0}>
        <tbody>
          {paginatedItems.length > 0 &&
            paginatedItems.map((stakingPool: StakingType, index) => (
              <>
                <Divider backgroundColor="#101116" />
                <TableRow key={index} index={index} staking={stakingPool} isMobile={isMobile} />
              </>
            ))}
        </tbody>
        {paginatedItems.length === 0 && (
          <tbody>
            <tr>
              <td>
                <div style={{ margin: '0 auto' }}>
                  {isLoading ? (
                    <Image src={isMobile ? LOADING_LOCK_MOBILE : LOADING_LOCK} alt="loading-lock" />
                  ) : (
                    <Image src={isMobile ? EMPTY_LOCK_MOBILE : EMPTY_LOCK} alt="empty-lock" />
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
                  <NoResults>No lock found</NoResults>
                )}
              </td>
            </tr>
          </tbody>
        )}
      </TableWrapper>
      <PaginationWrapper>
        {paginatedItems.length > 0 && (
          <Pagination count={stakings.length} pageCount={pageCount} onPageChange={onPageChange} />
        )}
      </PaginationWrapper>
    </Wrapper>
  )
}

const CustomButton = styled(ExternalLink)`
  width: 100%;
  padding: 14px 12px;
  span {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height:34px;
  `}
`

enum BUTTON_TYPE {
  BEETHOVEN = 'BEETHOVEN',
  SPOOKY_SWAP = 'SPOOKY_SWAP',
  MINI = 'MINI',
}

const titles = {
  beethoven: 'beethoven-',
  spookySwap: 'SpookySwap',
  mini: 'Manage',
}
const CustomButtonWrapper = ({ type, href, isActive }: { type: BUTTON_TYPE; href: string; isActive: boolean }) => {
  return (
    <CustomButton transparentBG href={isActive && href}>
      <ButtonText>
        {type === BUTTON_TYPE.MINI ? titles.mini : 'Farm on'}
        <HStack style={{ marginLeft: '1ch', alignItems: 'flex-end' }}>
          <Image
            width={type === BUTTON_TYPE.BEETHOVEN ? 102 : type === BUTTON_TYPE.MINI ? 8 : 110}
            height={type === BUTTON_TYPE.BEETHOVEN ? 16 : type === BUTTON_TYPE.MINI ? 8 : 19}
            src={type === BUTTON_TYPE.BEETHOVEN ? Beethoven : type === BUTTON_TYPE.MINI ? ExternalIcon : Spooky}
            alt={
              type === BUTTON_TYPE.BEETHOVEN
                ? titles.beethoven
                : type === BUTTON_TYPE.MINI
                ? titles.mini
                : titles.spookySwap
            }
          />
        </HStack>
      </ButtonText>
    </CustomButton>
  )
}
const SpaceBetween = styled(HStack)`
  justify-content: space-between;
`
const TableRowLargeContainer = styled.div`
  width: 100%;
  display: table;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:none;
  `};
`
const MiniStakeHeaderContainer = styled(SpaceBetween)``
const MiniStakeContainer = styled.div`
  margin-block: 2px;
  background: ${({ theme }) => theme.bg1};
  display: none;
  padding: 16px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display:block;
  `};
`
const MiniStakeContentContainer = styled(VStack)`
  margin-top: 16px;
`
const MiniTopBorderWrap = styled(TopBorderWrap)`
  min-width: 109px;
  margin: 0px;
  & > * {
    min-width: 109px;
    max-height: 32px;
  }
`
interface ITableRowContent {
  tokens: Token[]
  name: StakingType['name']
  active: StakingType['active']
  rewardTokens: StakingType['rewardTokens']
  handleClick: () => void
  apr: number
  tvl: number
  provideLink?: string
  version: StakingVersion
  chainIdError: boolean
  rpcChangerCallback: (chainId: any) => void
  account: string | null | undefined
  toggleWalletModal: () => void
}

const TableRowMiniContent = ({
  tokens,
  name,
  active,
  rewardTokens,
  handleClick,
  apr,
  tvl,
  provideLink,
  version,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
}: ITableRowContent) => {
  return (
    <MiniStakeContainer>
      <MiniStakeHeaderContainer>
        <TokenBox tokens={tokens} title={name} active={active} />
        <div>
          <MiniTopBorderWrap active={!chainIdError}>
            <TopBorder
              {...(version !== StakingVersion.EXTERNAL && {
                onClick: active && !chainIdError ? handleClick : undefined,
              })}
            >
              {!account ? (
                <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
                  <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
                </PrimaryButtonWide>
              ) : chainIdError ? (
                <PrimaryButtonWide transparentBG onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
                  <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
                </PrimaryButtonWide>
              ) : version === StakingVersion.EXTERNAL && provideLink ? (
                <CustomButtonWrapper isActive={active} href={provideLink} type={BUTTON_TYPE.MINI} />
              ) : (
                <PrimaryButtonWide transparentBG>
                  <ButtonText gradientText={!active}>{active ? 'Manage' : 'Withdraw'}</ButtonText>
                </PrimaryButtonWide>
              )}
            </TopBorder>
          </MiniTopBorderWrap>
        </div>
      </MiniStakeHeaderContainer>
      <MiniStakeContentContainer>
        <SpaceBetween>
          <Name>TVL</Name>
          <Value>{formatDollarAmount(tvl)}</Value>
        </SpaceBetween>
        <SpaceBetween>
          <Name>APR</Name>
          <Value> {apr !== -1 ? apr.toFixed(0) + '%' : 'N/A'} </Value>
        </SpaceBetween>
        <SpaceBetween>
          <Name>Reward Tokens</Name>
          <RewardBox tokens={rewardTokens} />
        </SpaceBetween>
      </MiniStakeContentContainer>
    </MiniStakeContainer>
  )
}

const TableRowLargeContent = ({
  tokens,
  name,
  active,
  rewardTokens,
  handleClick,
  apr,
  tvl,
  provideLink,
  version,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
}: ITableRowContent) => {
  return (
    <>
      <Cell width={'25%'}>
        <TokenBox tokens={tokens} title={name} active={active} />
      </Cell>

      <Cell width={'10%'}>
        <Name>APR</Name>
        <Value> {apr !== -1 ? apr.toFixed(0) + '%' : 'N/A'} </Value>
      </Cell>

      <Cell width={'18%'}>
        <Name>TVL</Name>
        <Value>{formatDollarAmount(tvl)}</Value>
      </Cell>

      <Cell style={{ textAlign: 'start' }}>
        <Name>Reward Tokens</Name>
        <RewardBox tokens={rewardTokens} />
      </Cell>

      <Cell width={'20%'} style={{ padding: '5px 10px' }}>
        <TopBorderWrap
          active={!chainIdError}
          {...(version !== StakingVersion.EXTERNAL && { onClick: active && !chainIdError ? handleClick : undefined })}
        >
          <TopBorder>
            {!account ? (
              <PrimaryButtonWide transparentBG onClick={toggleWalletModal}>
                <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
              </PrimaryButtonWide>
            ) : chainIdError ? (
              <PrimaryButtonWide transparentBG onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
                <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
              </PrimaryButtonWide>
            ) : version === StakingVersion.EXTERNAL && provideLink ? (
              <CustomButtonWrapper
                isActive={active}
                href={provideLink}
                type={provideLink.includes('spooky') ? BUTTON_TYPE.SPOOKY_SWAP : BUTTON_TYPE.BEETHOVEN}
              />
            ) : (
              <PrimaryButtonWide style={{ backgroundColor: '#101116' }} transparentBG>
                <ButtonText gradientText={!active}>{active ? 'Manage' : 'Withdraw'}</ButtonText>
              </PrimaryButtonWide>
            )}
          </TopBorder>
        </TopBorderWrap>
      </Cell>
    </>
  )
}

const TableRowContent = ({ stakingPool }: { stakingPool: StakingType }) => {
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const toggleWalletModal = useWalletModalToggle()
  const { id, rewardTokens, active, name, provideLink = undefined, version } = stakingPool
  const liquidityPool = LiquidityPool.find((p) => p.id === stakingPool.id) || LiquidityPool[0]
  const tokens = liquidityPool?.tokens

  //const apr = staking.version === StakingVersion.EXTERNAL ? 0 : staking?.aprHook(staking)

  // generate total APR if pools have secondary APRs
  const primaryApy = stakingPool.version === StakingVersion.EXTERNAL ? 0 : stakingPool?.aprHook(stakingPool)
  const secondaryApy =
    stakingPool.version === StakingVersion.EXTERNAL ? 0 : stakingPool.secondaryAprHook(liquidityPool, stakingPool)
  const apr = primaryApy + secondaryApy

  const deusPrice = useDeusPrice()
  const deiPrice = useDeiPrice()

  const poolBalances = usePoolBalances(liquidityPool)

  const totalLockedValue = useMemo(() => {
    return poolBalances[1] * 2 * Number(stakingPool.name === 'DEI-bDEI' ? deiPrice : deusPrice)
  }, [deiPrice, deusPrice, poolBalances, stakingPool])

  const supportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return chainId === SupportedChainId.FANTOM
  }, [chainId, account])

  const { totalDepositedAmount } = useUserInfo(stakingPool)

  const isSingleStakingPool = useMemo(() => {
    return stakingPool.isSingleStaking
  }, [stakingPool])

  const { swapRatio: xDeusRatio } = useVDeusStats()
  const { swapRatio: bDeiRatio } = useBDeiStats()

  const totalDepositedValue = useMemo(() => {
    return stakingPool.id === 1
      ? totalDepositedAmount * bDeiRatio * parseFloat(deiPrice)
      : stakingPool.id === 3
      ? totalDepositedAmount * xDeusRatio * parseFloat(deusPrice)
      : 0
  }, [bDeiRatio, deiPrice, deusPrice, stakingPool, totalDepositedAmount, xDeusRatio])

  const router = useRouter()
  const handleClick = useCallback(() => {
    router.push(`/stake/manage/${id}`)
  }, [id, router])
  return (
    <>
      <TableRowLargeContainer>
        <TableRowLargeContent
          active={active}
          handleClick={handleClick}
          name={name}
          rewardTokens={rewardTokens}
          tokens={tokens}
          apr={apr}
          tvl={isSingleStakingPool ? totalDepositedValue : totalLockedValue}
          provideLink={provideLink}
          version={version}
          chainIdError={!supportedChainId}
          rpcChangerCallback={rpcChangerCallback}
          account={account}
          toggleWalletModal={toggleWalletModal}
        />
      </TableRowLargeContainer>
      <TableRowMiniContent
        active={active}
        handleClick={handleClick}
        name={name}
        rewardTokens={rewardTokens}
        tokens={tokens}
        apr={apr}
        tvl={isSingleStakingPool ? totalDepositedValue : totalLockedValue}
        provideLink={provideLink}
        version={version}
        chainIdError={!supportedChainId}
        rpcChangerCallback={rpcChangerCallback}
        account={account}
        toggleWalletModal={toggleWalletModal}
      />
    </>
  )
}

function TableRow({ staking, index, isMobile }: { staking: StakingType; index: number; isMobile?: boolean }) {
  // const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  // const [ClaimAwaitingConfirmation, setClaimAwaitingConfirmation] = useState(false)
  // const [pendingTxHash, setPendingTxHash] = useState('')

  // const { id, rewardTokens, active, name } = staking

  // const veDEUSContract = useVeDeusContract()
  // const addTransaction = useTransactionAdder()
  // const showTransactionPending = useHasPendingVest(pendingTxHash, true)
  // const veDistContract = useVeDistContract()

  // subtracting 10 seconds to mitigate this from being true on page load
  // const lockHasEnded = useMemo(() => dayjs.utc(lockEnd).isBefore(dayjs.utc().subtract(10, 'seconds')), [lockEnd])

  // const onClaim = useCallback(async () => {
  //   try {
  //     if (!veDistContract) return
  //     setClaimAwaitingConfirmation(true)
  //     const response = await veDistContract.claim(nftId)
  //     addTransaction(response, { summary: `Claim #${nftId} reward`, vest: { hash: response.hash } })
  //     setPendingTxHash(response.hash)
  //     setClaimAwaitingConfirmation(false)
  //   } catch (err) {
  //     console.log(DefaultHandlerError(err))
  //     setClaimAwaitingConfirmation(false)
  //     setPendingTxHash('')
  //     if (err?.code === 4001) {
  //       toast.error('Transaction rejected.')
  //     } else toast.error(DefaultHandlerError(err))
  //   }
  // }, [veDistContract, nftId, addTransaction])

  // const onWithdraw = useCallback(async () => {
  //   try {
  //     if (!veDEUSContract || !lockHasEnded) return
  //     setAwaitingConfirmation(true)
  //     const response = await veDEUSContract.withdraw(nftId)
  //     addTransaction(response, { summary: `Withdraw #${nftId} from Vesting`, vest: { hash: response.hash } })
  //     setPendingTxHash(response.hash)
  //     setAwaitingConfirmation(false)
  //   } catch (err) {
  //     console.error(err)
  //     setAwaitingConfirmation(false)
  //     setPendingTxHash('')
  //   }
  // }, [veDEUSContract, lockHasEnded, nftId, addTransaction])

  // function getExpirationCell() {
  //   if (!lockHasEnded)
  //     return (
  //       <>
  //         <Name>Expiration</Name>
  //         <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
  //         {/* <CellDescription>Expires in {dayjs.utc(lockEnd).fromNow(true)}</CellDescription> */}
  //       </>
  //     )
  //   return (
  //     <ExpirationPassed>
  //       <Name>Expired in</Name>
  //       <Value>{dayjs.utc(lockEnd).format('LLL')}</Value>
  //     </ExpirationPassed>
  //   )
  // }

  // function getClaimWithdrawCell() {
  //   if (awaitingConfirmation || showTransactionPending) {
  //     return (
  //       <TopBorderWrap>
  //         <TopBorder>
  //           <PrimaryButtonWide transparentBG>
  //             <ButtonText gradientText>
  //               {awaitingConfirmation ? 'Confirming' : 'Withdrawing'} <DotFlashing />
  //             </ButtonText>
  //           </PrimaryButtonWide>
  //         </TopBorder>
  //       </TopBorderWrap>
  //     )
  //   } else if (lockHasEnded) {
  //     return (
  //       <TopBorderWrap>
  //         <TopBorder>
  //           <PrimaryButtonWide transparentBG onClick={onWithdraw}>
  //             <ButtonText gradientText>Withdraw</ButtonText>
  //           </PrimaryButtonWide>
  //         </TopBorder>
  //       </TopBorderWrap>
  //     )
  //   } else if (reward) {
  //     if (ClaimAwaitingConfirmation || showTransactionPending) {
  //       return (
  //         <PrimaryButtonWide>
  //           <ButtonText>
  //             {ClaimAwaitingConfirmation ? 'Confirming' : 'Claiming'} <DotFlashing />
  //           </ButtonText>
  //         </PrimaryButtonWide>
  //       )
  //     }
  //     return (
  //       <PrimaryButtonWide style={{ margin: '0 auto' }} onClick={onClaim}>
  //         <ButtonText>Claim {formatAmount(reward, 3)}</ButtonText>
  //       </PrimaryButtonWide>
  //     )
  //   }
  //   return null
  // }

  // function getTableRowMobile() {
  //   return (
  //     <MobileWrapper>
  //       <FirstRow>
  //         <RowCenter>
  //           <ImageWithFallback src={DEUS_LOGO} alt={`veDeus logo`} width={30} height={30} />
  //           <NFTWrap>
  //             <CellAmount>veDEUS #{nftId}</CellAmount>
  //           </NFTWrap>
  //         </RowCenter>

  //         <RowCenter style={{ padding: '5px 2px' }}>{getClaimWithdrawCell()}</RowCenter>

  //         <RowCenter style={{ padding: '5px 2px' }}>
  //           <PrimaryButtonWide whiteBorder onClick={() => toggleLockManager(nftId)}>
  //             <ButtonText>Update Lock</ButtonText>
  //           </PrimaryButtonWide>
  //         </RowCenter>
  //       </FirstRow>

  //       <MobileCell>
  //         <Name>Vest Amount</Name>
  //         <Value>{formatAmount(parseFloat(deusAmount), 8)} DEUS</Value>
  //       </MobileCell>

  //       <MobileCell>
  //         <Name>Vest Value</Name>
  //         <Value>{formatAmount(parseFloat(veDEUSAmount), 6)} veDEUS</Value>
  //       </MobileCell>

  //       <MobileCell>{getExpirationCell()}</MobileCell>
  //     </MobileWrapper>
  //   )
  // }

  return (
    <ZebraStripesRow isEven={index % 2 === 0}>
      <TableRowContent stakingPool={staking} />
    </ZebraStripesRow>
  )
}
