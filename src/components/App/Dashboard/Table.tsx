import styled from 'styled-components'
import { useCallback, useMemo } from 'react'
import { MultipleImageWrapper } from 'components/App/Stake/TokenBox'
import { formatAmount } from 'utils/numbers'
import {
  ButtonText,
  CustomButtonWrapper,
  ITableRowContent,
  TableRowLargeContent,
  TopBorder,
  TopBorderWrap,
} from '../Stake/Table'
import { LiquidityPool, StakingType, StakingVersion } from 'constants/stakingPools'
import { PrimaryButtonWide } from 'components/Button'
import { FALLBACK_CHAIN_ID, SupportedChainId } from 'constants/chains'
import useWeb3React from 'hooks/useWeb3'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { useWalletModalToggle } from 'state/application/hooks'
import { useUserInfo } from 'hooks/useStakingInfo'
import { useRouter } from 'next/router'
import ImageWithFallback from 'components/ImageWithFallback'
import { isMobile } from 'react-device-detect'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import Column from 'components/Column'
import { StakingProps } from './Staking'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
`

const TableWrapper = styled.table`
  width: 100%;
  overflow: hidden;
  table-layout: fixed;
  border-collapse: collapse;
  background: ${({ theme }) => theme.bg1};
`
const TableRowLargeContainer = styled.tr`
  width: 100%;
  display: table;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display:none;
  `};
`
export const Cell = styled.td<{ justify?: boolean }>`
  align-items: center;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  height: 90px;
`

const MiniRow = styled.tr`
  width: 100%;
  border-radius: 12px;
  border: 2px solid;
  border-color: ${({ theme }) => theme.bg3};
  padding: 12px;
  margin-bottom: 12px;
  justify-content: space-between;
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
  `};
`
const MiniImageTd = styled.td`
  align-items: center;
  display: flex;
  & > div:last-of-type {
    margin-left: 24px;
    height: 100%;
    justify-content: space-between;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: 8px;
  `};
    p {
      font-size: 12px;
      font-family: 'IBM Plex Mono';
      &:first-of-type {
        color: ${({ theme }) => theme.text1};
        font-weight: 600;
      }
      &:last-of-type {
        color: ${({ theme }) => theme.bg6};
        font-weight: 500;
        margin-top: 12px;
      }
    }
  }
`
const StackedAmountTd = styled.td`
  div {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    p {
      font-size: 12px;
      font-family: 'IBM Plex Mono';
      &:first-of-type {
        color: ${({ theme }) => theme.text2};
        font-weight: 400;
      }
      &:last-of-type {
        color: ${({ theme }) => theme.text1};
        font-weight: 500;
      }
    }
  }
`
const ButtonTd = styled.td`
  div:first-of-type {
    margin: 0px;
    div:first-of-type {
      div:first-of-type {
        height: 30px !important;
        padding: 13px !important;
      }
    }
  }
  span {
    font-size: 10px;
    background: -webkit-linear-gradient(1deg, #e29d52 -10.26%, #de4a7b 90%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`

function getImageSize() {
  return isMobile ? 22 : 30
}
const TableRowMiniContent = ({
  tokens,
  name,
  active,
  handleClick,
  apr,
  provideLink,
  version,
  chainIdError,
  rpcChangerCallback,
  account,
  toggleWalletModal,
  type,
  depositAmount,
}: ITableRowContent & { depositAmount: string }) => {
  const tokensAddress = tokens.map((token) => token.address)
  const logos = useCurrencyLogos(tokensAddress)
  return (
    <MiniRow>
      <MiniImageTd>
        <MultipleImageWrapper isSingle={logos.length === 1}>
          {logos.map((logo, index) => {
            return (
              <ImageWithFallback
                src={logo}
                width={getImageSize()}
                height={getImageSize()}
                alt={`Logo`}
                key={index}
                round
              />
            )
          })}
        </MultipleImageWrapper>
        <Column>
          <p>{name}</p>
          <p>APR:{apr ? formatAmount(apr) + '%' : 'N/A'}</p>
        </Column>
      </MiniImageTd>
      <StackedAmountTd>
        <Column>
          <p>Staked Amount:</p>
          <p>
            {Number(depositAmount).toFixed(6)}{' '}
            {tokens.map((token, index) => (index + 1 !== tokens.length ? token?.symbol + '-' : token?.symbol))}
          </p>
        </Column>
      </StackedAmountTd>
      <ButtonTd>
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
              <CustomButtonWrapper isActive={active} href={provideLink} type={type} />
            ) : (
              <PrimaryButtonWide style={{ backgroundColor: '#101116' }} transparentBG>
                <ButtonText gradientText={!active}>{active ? 'Manage' : 'Withdraw'}</ButtonText>
              </PrimaryButtonWide>
            )}
          </TopBorder>
        </TopBorderWrap>
      </ButtonTd>
    </MiniRow>
  )
}

const TableRowContent = ({ stakingPool }: { stakingPool: StakingType }) => {
  const { chainId, account } = useWeb3React()
  const rpcChangerCallback = useRpcChangerCallback()
  const toggleWalletModal = useWalletModalToggle()
  const { id, rewardTokens, active, name, provideLink = undefined, version, chain, type } = stakingPool
  const liquidityPool = LiquidityPool.find((p) => p.id === stakingPool.id) || LiquidityPool[0]
  const tokens = liquidityPool?.tokens

  const primaryApy = stakingPool?.aprHook(stakingPool)
  const secondaryApy =
    stakingPool.version === StakingVersion.EXTERNAL ? 0 : stakingPool.secondaryAprHook(liquidityPool, stakingPool)
  const apr = primaryApy + secondaryApy

  const tvl = stakingPool.tvlHook(stakingPool)
  const supportedChainId: boolean = useMemo(() => {
    if (!chainId || !account) return false
    return chainId === SupportedChainId.FANTOM
  }, [chainId, account])
  const { rewardAmounts, depositAmount } = useUserInfo(stakingPool)

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
        depositAmount={depositAmount}
      />
    </>
  )
}

const Table = ({ stakings }: StakingProps) => {
  return (
    <Wrapper>
      <TableWrapper>
        <tbody>
          {stakings.map((stakingPool: StakingType) => (
            <TableRowContent key={stakingPool.id} stakingPool={stakingPool} />
          ))}
        </tbody>
      </TableWrapper>
    </Wrapper>
  )
}

export default Table
