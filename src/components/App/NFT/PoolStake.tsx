import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { toast } from 'react-hot-toast'

import { useWalletModalToggle } from 'state/application/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useSupportedChainId } from 'hooks/useSupportedChainId'
import { useVDeusMasterChefV2Contract, useVDeusStakingContract } from 'hooks/useContract'
import { useERC721ApproveAllCallback, ApprovalState } from 'hooks/useApproveNftCallback2'
import { useVDeusStats } from 'hooks/useVDeusStats'
import { useGetApr, useUserInfo, usePoolInfo } from 'hooks/useVDeusStaking'

import { DefaultHandlerError } from 'utils/parseError'
import { formatAmount } from 'utils/numbers'
import { vDeusStakingType } from 'constants/stakings'
import { vDeus, vDeusStaking } from 'constants/addresses'
import { DEUS_TOKEN } from 'constants/tokens'

import Dropdown from 'components/DropDown'
import { Row, RowCenter } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import { DotFlashing } from 'components/Icons'
import { useRouter } from 'next/router'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  & > * {
    &:nth-child(2) {
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }
    &:last-child {
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
`

const Wrapper = styled(Container)`
  display: flex;
  justify-content: flex-start;
  border: ${({ theme }) => `2px solid ${theme.bg2}`};
  flex-direction: column;
  margin: 50px 10px 0 10px;
  padding-top: 20px;
  border-radius: 15px;
  background: ${({ theme }) => theme.bg0};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `};
`

const UpperRow = styled(RowCenter)`
  margin: 0 auto;
  margin-top: 15px;
  height: 50px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    justify-content: center;
    flex-direction: column;
  `}
  & > * {
    height: 100%;
    max-width: fit-content;

    &:first-child {
      max-width: 300px;

      ul {
        ${({ theme }) => theme.mediaWidth.upToSmall`
            max-width: 256px;
          `}
      }
    }
  }
`

const DepositButton = styled(PrimaryButton)`
  margin-top: 12px;
  margin-bottom: 4px;
  border-radius: 12px;
  max-width: 312px;
  width: 100%;
  height: 55px;
`

const ClaimButtonWrapper = styled.div`
  background: ${({ theme }) => theme.primary1};

  padding: 1px;
  border-radius: 8px;
  margin-top: 12px;
  margin-bottom: 12px;
  height: 40px;
`

const ClaimButton = styled(PrimaryButton)`
  border-radius: 8px;
  background: ${({ theme }) => theme.bg0};
  height: 100%;
  width: unset;
  white-space: nowrap;
  &:hover {
    & > * {
      &:first-child {
        color: ${({ theme }) => theme.text2};
        -webkit-text-fill-color: black;
        font-weight: 900;
      }
    }
  }
`

const BoxWrapper = styled.div`
  width: 350px;
  padding: 14px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border-top: ${({ theme }) => `2px solid ${theme.bg2}`};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 350px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 300px;
  `}
`

const DepositWrapper = styled(BoxWrapper)`
  margin-top: 30px;
  border: none;
`

const WithdrawWrapper = styled(BoxWrapper)`
  display: flex;
  flex-direction: row;
  font-size: 12px;
`

const ClaimWrapper = styled(BoxWrapper)`
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  padding-top: 0;
  padding-bottom: 0;
`

const RewardData = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: 6px;
  padding-bottom: 8px;
  margin: 0 auto;
  font-size: 12px;
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const YieldTitle = styled.div`
  background: -webkit-linear-gradient(90deg, #e29c53 0%, #ce4c7a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  font-size: 24px;
  font-family: 'IBM Plex Mono';
  word-spacing: -12px;
`

const TitleInfo = styled.div`
  padding: 20px;
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
  font-family: 'IBM Plex Mono';
`

const TimeTitle = styled.span`
  font-size: 24px;
  font-weight: 700;
  font-family: 'IBM Plex Mono';
  word-spacing: -10px;
`

const TitleNFTSpan = styled.span`
  margin: 0 auto;
  text-align: center;
  max-width: 250px;
  color: #979797;
`

const ButtonText = styled.span`
  background: -webkit-linear-gradient(90deg, #e29c53 0%, #ce4c7a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const AmountSpan = styled.span`
  color: #fdb572;
`

export default function PoolStake({ pool }: { pool: vDeusStakingType }) {
  const { chainId, account } = useWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isSupportedChainId = useSupportedChainId()
  const [selectedNftId, setSelectedNftId] = useState('0')
  const [dropDownDefaultValue, setDropDownDefaultValue] = useState<string | undefined>('0')
  const [awaitingDepositConfirmation, setAwaitingDepositConfirmation] = useState<boolean>(false)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const { listOfVouchers, numberOfVouchers } = useVDeusStats()

  const addTransaction = useTransactionAdder()
  const router = useRouter()

  const dropdownOnSelect = useCallback((val: string) => {
    setSelectedNftId(val)
    setDropDownDefaultValue(val)
    // console.log('draw down on select', { val })
    return
  }, [])

  const dropdownOptions = listOfVouchers.map((tokenId: number) => ({
    label: `vDEUS #${tokenId}`,
    value: `${tokenId}`,
  }))

  const stakingContract = useVDeusStakingContract()
  const masterChefContract = useVDeusMasterChefV2Contract()
  // const lockedNFTs = useUserLockedNfts()
  const { depositAmount, rewardsAmount } = useUserInfo(pool.pid)
  const { totalDeposited } = usePoolInfo(pool.pid)
  const apr = useGetApr(pool.pid)
  const spender = useMemo(() => (chainId ? vDeusStaking[chainId] : undefined), [chainId])

  const [awaitingApproveConfirmation, setAwaitingApproveConfirmation] = useState<boolean>(false)

  const [approvalState, approveCallback] = useERC721ApproveAllCallback(chainId ? vDeus[chainId] : undefined, spender)

  const showApprove = useMemo(() => approvalState !== ApprovalState.APPROVED, [approvalState])

  const handleApprove = async () => {
    setAwaitingApproveConfirmation(true)
    await approveCallback()
    setAwaitingApproveConfirmation(false)
  }

  useEffect(() => {
    setDropDownDefaultValue(undefined)
  }, [])

  const onClaimReward = useCallback(
    async (pid: number) => {
      try {
        if (!masterChefContract || !account || !isSupportedChainId || !rewardsAmount) return
        setAwaitingClaimConfirmation(true)
        const response = await masterChefContract.harvest(pid, account)
        addTransaction(response, { summary: `Claim Rewards`, vest: { hash: response.hash } })
        setAwaitingClaimConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingClaimConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [masterChefContract, account, isSupportedChainId, rewardsAmount, addTransaction]
  )

  const onDeposit = useCallback(
    async (pid: number) => {
      try {
        if (!stakingContract || !account || !isSupportedChainId) return
        setAwaitingDepositConfirmation(true)
        const response = await stakingContract.deposit(pid, selectedNftId, account)
        addTransaction(response, { summary: `Deposit vDEUS #${selectedNftId}` })
        setAwaitingDepositConfirmation(false)
        // setPendingTxHash(response.hash)
      } catch (err) {
        console.log(err)
        toast.error(DefaultHandlerError(err))
        setAwaitingDepositConfirmation(false)
        // setPendingTxHash('')
      }
    },
    [stakingContract, addTransaction, account, selectedNftId, isSupportedChainId]
  )
  function getApproveButton(): JSX.Element | null {
    if (!isSupportedChainId || !account || numberOfVouchers <= 0) {
      return null
    }

    if (awaitingApproveConfirmation) {
      return (
        <DepositButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }

    if (showApprove) {
      return <DepositButton onClick={handleApprove}>Approve vDEUS</DepositButton>
    }
    return null
  }

  function getDepositButton(pid: number): JSX.Element | null {
    if (!chainId || !account) {
      return <DepositButton onClick={toggleWalletModal}>Connect Wallet</DepositButton>
    }
    if (showApprove) {
      return null
    }
    if (awaitingDepositConfirmation) {
      return (
        <DepositButton>
          Depositing <DotFlashing style={{ marginLeft: '10px' }} />
        </DepositButton>
      )
    }
    return <DepositButton onClick={() => onDeposit(pid)}>Deposit your NFT</DepositButton>
  }

  function getClaimButton(pool: vDeusStakingType): JSX.Element | null {
    if (awaitingClaimConfirmation) {
      return (
        <>
          <ClaimButtonWrapper>
            <ClaimButton disabled={true}>
              <ButtonText>
                Claim
                <DotFlashing style={{ marginLeft: '10px' }} />
              </ButtonText>
            </ClaimButton>
          </ClaimButtonWrapper>
        </>
      )
    }
    if (rewardsAmount <= 0) {
      return (
        <>
          <ClaimButtonWrapper>
            <ClaimButton disabled={true}>
              <ButtonText>Claim</ButtonText>
            </ClaimButton>
          </ClaimButtonWrapper>
        </>
      )
    }
    return (
      <>
        <ClaimButtonWrapper>
          <ClaimButton onClick={() => onClaimReward(pool.pid)}>
            <ButtonText>Claim</ButtonText>
          </ClaimButton>
        </ClaimButtonWrapper>
      </>
    )
  }

  return (
    <Wrapper>
      <TitleInfo>
        <TimeTitle>{pool.name}</TimeTitle>
        <YieldTitle>APR: {apr.toFixed(0)}%</YieldTitle>
      </TitleInfo>

      <DepositWrapper>
        {!chainId || !account ? (
          <TitleNFTSpan>Connect your wallet to select DEUS voucher NFT</TitleNFTSpan>
        ) : numberOfVouchers > 0 ? (
          <UpperRow>
            <Dropdown
              options={dropdownOptions}
              placeholder="select an NFT"
              defaultValue={dropDownDefaultValue}
              onSelect={(v) => dropdownOnSelect(v)}
              width="300px"
            />
          </UpperRow>
        ) : (
          <DepositButton onClick={() => router.push('/redemption')}>GET vDEUS</DepositButton>
        )}

        <div style={{ marginTop: '20px' }}></div>
        {getApproveButton()}
        {getDepositButton(pool.pid)}
      </DepositWrapper>

      {depositAmount > 0 && (
        <WithdrawWrapper>
          <span>Your redemption stake: </span>
          <AmountSpan>{formatAmount(depositAmount)} DEI</AmountSpan>
        </WithdrawWrapper>
      )}

      {totalDeposited > 0 && (
        <WithdrawWrapper>
          <span> Total redemption staked: </span>
          <AmountSpan>{formatAmount(totalDeposited)} DEI</AmountSpan>
        </WithdrawWrapper>
      )}

      <ClaimWrapper>
        <div>
          <span style={{ fontSize: '12px' }}>Reward:</span>
          <RewardData>
            <span>{rewardsAmount && rewardsAmount?.toFixed(3)}</span>
            <Row style={{ marginLeft: '10px' }}>
              <span>{DEUS_TOKEN.symbol}</span>
            </Row>
          </RewardData>
        </div>
        <div>{getClaimButton(pool)}</div>
      </ClaimWrapper>
    </Wrapper>
  )
}
