import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
// import toast from 'react-hot-toast'

// import { useVeDeusContract } from 'hooks/useContract'
// import { useHasPendingVest, useTransactionAdder } from 'state/transactions/hooks'
// import { useVestedInformation } from 'hooks/useVested'
// import { useVeDistContract } from 'hooks/useContract'

// import ImageWithFallback from 'components/ImageWithFallback'
// import { RowCenter } from 'components/Row'
import { BaseButton, PrimaryButtonWide } from 'components/Button'
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
import { Divider, HStack } from '../Staking/common/Layout'
import SPOOKY_SWAP_IMG from '/public/static/images/pages/stake/spooky.svg'
import BEETHOVEN_IMG from '/public/static/images/pages/stake/beethoven.svg'
// import SOLIDLY_IMG from '/public/static/images/pages/stake/solid.png'
import SOLIDLY_IMG from '/public/static/images/pages/stake/solidly.svg'
import ExternalIcon from '/public/static/images/pages/stake/down.svg'

import { Token } from '@sushiswap/core-sdk'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { FALLBACK_CHAIN_ID, SupportedChainId } from 'constants/chains'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useWalletModalToggle } from 'state/application/hooks'
import { BUTTON_TYPE } from 'constants/misc'
import { useUserInfo } from 'hooks/useStakingInfo'
import { useCurrencyBalance } from 'state/wallet/hooks'

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

const Loading = styled.div`
  background: ${({ theme }) => theme.bg6};
  border-radius: 6px;
  height: 14px;
  width: 100%;
`

export const Cell = styled.td<{ justify?: boolean }>`
  align-items: center;
  text-align: center;
  vertical-align: middle;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  padding: 20px 16px;
`

const NoResults = styled.div<{ warning?: boolean }>`
  text-align: center;
  padding: 20px;
  color: ${({ theme, warning }) => (warning ? theme.warning : 'white')};
`

const PaginationWrapper = styled.div`
  background: ${({ theme }) => theme.bg1};
  /* background: ${({ theme }) => theme.bg0}; */
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  width: 100%;
  margin-top: 2px;
  padding-block: 19px;
  text-align: center;
  color: ${({ theme }) => theme.text2};
  font-family: 'Inter';
`

const Name = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-top: 12px;
  `};
`

export const ButtonText = styled.span<{ gradientText?: boolean }>`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}

  ${({ gradientText }) =>
    gradientText &&
    `
    background: linear-gradient(90deg, #359ECC 0%, #31B0A9 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  `}
`

export const TopBorderWrap = styled.div<{ active?: boolean }>`
  // background: ${({ theme, active }) => (active ? theme.primary2 : theme.white)};
  padding: 2px;
  border-radius: 12px;
  margin-right: 4px;
  margin-left: 3px;
  // border: 1px solid ${({ theme }) => theme.bg0};
  flex: 1;

  // &:hover {
  //   border: 1px solid ${({ theme, active }) => (active ? theme.bg0 : theme.warning)};
  // }
`

export const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border-radius: 8px;
  height: 100%;
  width: 100%;
  display: flex;
`

const itemsPerPage = 12

interface TableRowItemProps {
  index: number
  stakingPool: StakingType
  isMobile: boolean | undefined
}

const TableRowItem = ({ stakingPool }: TableRowItemProps) => <TableRow staking={stakingPool} />

export default function Table({
  isMobile,
  stakings,
  hideFooter,
}: {
  isMobile?: boolean
  stakings: StakingType[]
  hideFooter?: boolean
}) {
  const [offset, setOffset] = useState(0)
  const { account } = useWeb3React()

  const paginatedItems = useMemo(() => {
    return stakings.slice(offset, offset + itemsPerPage)
  }, [stakings, offset])

  // const pageCount = useMemo(() => {
  //   return Math.ceil(stakings.length / itemsPerPage)
  // }, [stakings])

  // const onPageChange = ({ selected }: { selected: number }) => {
  //   setOffset(Math.ceil(selected * itemsPerPage))
  // }

  const isLoading = false

  return (
    <Wrapper>
      <TableWrapper isEmpty={paginatedItems.length === 0}>
        <tbody>
          {paginatedItems.length > 0 &&
            paginatedItems.map((stakingPool: StakingType, index) => (
              <>
                <Divider backgroundColor="#141414" />
                <TableRowItem key={stakingPool.id} index={index} stakingPool={stakingPool} isMobile={isMobile} />
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
      {!hideFooter && (
        <PaginationWrapper>
          {/* {paginatedItems.length > 0 && (
          <Pagination count={stakings.length} pageCount={pageCount} onPageChange={onPageChange} />
        )} */}
          {paginatedItems.length} of {stakings.length} Stakings
        </PaginationWrapper>
      )}
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

const buttonTitles = {
  BEETHOVEN: 'Farm on',
  SPOOKY_SWAP: 'Farm on',
  SOLIDLY: 'Farm on',
  INTERNAL: 'Manage',
}

const buttonImageSources = {
  BEETHOVEN: BEETHOVEN_IMG,
  SPOOKY_SWAP: SPOOKY_SWAP_IMG,
  SOLIDLY: SOLIDLY_IMG,
  INTERNAL: ExternalIcon,
}

const buttonImageHeights = {
  BEETHOVEN: 20,
  SPOOKY_SWAP: 20,
  SOLIDLY: 20,
  INTERNAL: 0,
}

const buttonImageWidths = {
  BEETHOVEN: 120,
  SPOOKY_SWAP: 120,
  SOLIDLY: 60,
  INTERNAL: 0,
}

export const CustomButtonWrapper = ({
  type,
  href,
  isActive,
}: {
  type: BUTTON_TYPE
  href: string
  isActive: boolean
}) => {
  return (
    <ActionButton>
      <ButtonText>
        {buttonTitles[type]}
        <HStack style={{ marginLeft: '1ch', alignItems: 'flex-start' }}>
          <Image
            width={buttonImageWidths[type]}
            height={buttonImageHeights[type]}
            src={buttonImageSources[type]}
            alt={type}
          />
        </HStack>
      </ButtonText>
    </ActionButton>
  )
}
const SpaceBetween = styled(HStack)`
  justify-content: space-between;
`
const TableRowLargeContainer = styled.tr`
  width: 100%;
  display: table;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:none;
  `};
`
const MiniStakeHeaderContainer = styled.td`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const MiniStakeContainer = styled.tr`
  margin-block: 2px;
  background: ${({ theme }) => theme.bg1};
  display: none;
  padding: 16px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display:block;
  `};
`
const MiniStakeContentContainer = styled.td`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
`
const MiniTopBorderWrap = styled(TopBorderWrap)`
  min-width: 109px;
  margin: 0px;
  & > * {
    min-width: 109px;
    max-height: 32px;
  }
`
const ActionButton = styled(BaseButton)`
  background: ${({ theme }) => theme.bg0};
  backdrop-filter: blur(9px);
  border-radius: 8px;
  width: fit-content;
  margin: auto;
`

export interface ITableRowContent {
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
  rewardAmounts: number[]
  stakedAmount: string
  lpCurrencyBalance: string
  chain: string
  type: BUTTON_TYPE
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
  rewardAmounts,
  chain,
}: ITableRowContent) => {
  const hasReward = useMemo(() => {
    return rewardAmounts.every((value) => value === 0)
  }, [rewardAmounts])
  return (
    <MiniStakeContainer>
      <MiniStakeHeaderContainer>
        <TokenBox tokens={tokens} title={name} active={active} chain={chain} />
        <div>
          <MiniTopBorderWrap active={!chainIdError}>
            <TopBorder
              {...(version !== StakingVersion.EXTERNAL && {
                onClick: !chainIdError ? handleClick : undefined,
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
                <CustomButtonWrapper isActive={active} href={provideLink} type={BUTTON_TYPE.INTERNAL} />
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
        {/* <SpaceBetween>
          <Name>TVL</Name>
          <Value>{tvl ? formatDollarAmount(tvl) : 'N/A'}</Value>
        </SpaceBetween>
        <SpaceBetween>
          <Name>APR</Name>
          <Value> {apr ? formatAmount(apr) + '%' : 'N/A'} </Value>
        </SpaceBetween> */}
        <SpaceBetween>
          {hasReward ? <Name>Reward Tokens</Name> : <Name>Reward to claim</Name>}
          <RewardBox tokens={rewardTokens} rewardAmounts={rewardAmounts} />
        </SpaceBetween>
      </MiniStakeContentContainer>
    </MiniStakeContainer>
  )
}

export const TableRowLargeContent = ({
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
  rewardAmounts,
  chain,
  type,
  stakedAmount,
  lpCurrencyBalance,
}: ITableRowContent) => {
  const hasReward = useMemo(() => {
    return rewardAmounts.every((value) => value === 0)
  }, [rewardAmounts])
  return (
    <>
      <Cell style={{ width: '25%' }}>
        <TokenBox tokens={tokens} title={name} active={active} chain={chain} />
      </Cell>

      <Cell style={{ width: '10%' }}>{apr ? formatAmount(apr) + '%' : <Loading />}</Cell>

      <Cell style={{ width: '10%' }}>{tvl ? formatDollarAmount(tvl) : <Loading />}</Cell>

      <Cell style={{ width: '15%' }}>
        {parseFloat(stakedAmount) > 0 ? parseFloat(stakedAmount).toFixed(2) : <Loading />}
      </Cell>

      <Cell style={{ width: '15%' }}>
        <RewardBox tokens={rewardTokens} rewardAmounts={rewardAmounts} />
      </Cell>

      <Cell style={{ width: '25%' }}>
        {!account ? (
          <ActionButton onClick={toggleWalletModal}>
            <ButtonText gradientText={chainIdError}>Connect Wallet</ButtonText>
          </ActionButton>
        ) : chainIdError ? (
          <ActionButton onClick={() => rpcChangerCallback(FALLBACK_CHAIN_ID)}>
            <ButtonText gradientText={chainIdError}>Switch to Fantom</ButtonText>
          </ActionButton>
        ) : version === StakingVersion.EXTERNAL && provideLink ? (
          <CustomButtonWrapper isActive={active} href={provideLink} type={type} />
        ) : (
          <ActionButton onClick={handleClick}>
            <ButtonText gradientText>{active ? 'Manage' : 'Withdraw'}</ButtonText>
          </ActionButton>
        )}
      </Cell>
    </>
  )
}

const TableRowContent = ({ stakingPool }: { stakingPool: StakingType }) => {
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const toggleWalletModal = useWalletModalToggle()
  const { id, rewardTokens, active, name, provideLink = undefined, version, chain, type } = stakingPool
  const liquidityPool = LiquidityPool.find((p) => p.id === stakingPool.id) || LiquidityPool[0]
  const tokens = liquidityPool?.tokens
  const { depositAmount: stakedAmount } = useUserInfo(stakingPool)
  const lpCurrency = liquidityPool.lpToken
  const lpCurrencyBalance = useCurrencyBalance(account ?? undefined, lpCurrency)?.toFixed(2)

  //const apr = staking.version === StakingVersion.EXTERNAL ? 0 : staking?.aprHook(staking)

  // generate total APR if pools have secondary APRs
  const primaryApy = stakingPool?.aprHook(stakingPool)
  const secondaryApy =
    stakingPool.version === StakingVersion.EXTERNAL ? 0 : stakingPool.secondaryAprHook(liquidityPool, stakingPool)
  const apr = primaryApy + secondaryApy

  const tvl = stakingPool.tvlHook(stakingPool)

  // console.log('apr and tvl for ', apr, tvl, name, stakingPool?.aprHook, stakingPool?.tvlHook)

  const supportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return chainId === SupportedChainId.FANTOM
  }, [chainId, account])
  const { rewardAmounts } = useUserInfo(stakingPool)

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
          tvl={tvl}
          provideLink={provideLink}
          version={version}
          chainIdError={!supportedChainId}
          rpcChangerCallback={rpcChangerCallback}
          account={account}
          toggleWalletModal={toggleWalletModal}
          chain={chain}
          type={type}
          rewardAmounts={rewardAmounts}
          stakedAmount={stakedAmount}
          lpCurrencyBalance={lpCurrencyBalance || ''}
        />
      </TableRowLargeContainer>
      <TableRowMiniContent
        rewardAmounts={rewardAmounts}
        active={active}
        handleClick={handleClick}
        name={name}
        rewardTokens={rewardTokens}
        tokens={tokens}
        apr={apr}
        tvl={tvl}
        provideLink={provideLink}
        version={version}
        chainIdError={!supportedChainId}
        rpcChangerCallback={rpcChangerCallback}
        account={account}
        toggleWalletModal={toggleWalletModal}
        chain={chain}
        type={type}
        stakedAmount={stakedAmount}
        lpCurrencyBalance={lpCurrencyBalance || ''}
      />
    </>
  )
}

function TableRow({ staking }: { staking: StakingType }) {
  return <TableRowContent stakingPool={staking} />
}
