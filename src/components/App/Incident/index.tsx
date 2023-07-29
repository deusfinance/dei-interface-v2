import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { formatUnits } from '@ethersproject/units'

import { Container as MainContainer } from 'components/App/StableCoin'
import Column, { ColumnCenter } from 'components/Column'
import { InputField } from 'components/Input'
import { Row, RowBetween, RowStart } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import useWeb3React from 'hooks/useWeb3'
import UserStats from './UserStats'
import { makeHttpRequest } from 'utils/http'
import { ExternalLink } from 'components/Link'
import { NavButton } from 'components/Button'
import { useWalletModalToggle } from 'state/application/hooks'
import ReviewModal from './ReviewModal'
import ReviewModal2 from './ReviewModal2'
import { BDEI_TOKEN, DEI_BDEI_LP_TOKEN, DEUS_TOKEN, NEW_DEI_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { BN_ZERO, toBN } from 'utils/numbers'
import { useClaimDeusCallback, useReimbursementCallback } from 'hooks/useReimbursementCallback'
import { useGetClaimedData, useGetReimburseRatio } from 'hooks/useReimbursementPage'
import { SupportedChainId } from 'constants/chains'
import useRpcChangerCallback from 'hooks/useRpcChangerCallback'
import { ConnectButton, ConnectButtonText, ConnectButtonWrap } from 'components/Web3Status'
import { Link as LinkIcon } from 'components/Icons'

const Container = styled(MainContainer)`
  min-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-family: Inter;
`
const FormContainer = styled(ColumnCenter)`
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
`
const FormHeader = styled.div`
  margin-top: 50px;
  margin-bottom: 15px;
  font-weight: 500;
  font-size: 32px;
  color: ${({ theme }) => theme.text1};
`
const WalletAddressInputContainer = styled(RowBetween)`
  min-height: 60px;
  padding: 8px;
  background-color: #121313;
  border-radius: 12px;
  z-index: 2;
  border: 1px solid rgba(75, 73, 73, 0.9);
  margin-bottom: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-height: 45px;
    height: 45px;
  `}
`
const OutputContainer = styled(RowBetween)`
  display: flex;
  flex-flow: column nowrap;
  gap: 20px;
  min-height: 60px;
  padding: 14px;
  background-color: #121313;
  border-radius: 12px;
  z-index: 2;
  border: 1px solid rgba(75, 73, 73, 0.9);
  margin-bottom: 16px;
`
export const Title = styled.span`
  color: #aaaeae;
`
export const LinkTitle = styled(Title)`
  &:hover {
    color: white;
  }
`
export const Value = styled.span`
  margin-left: auto;
  margin-right: 6px;
`
export const MainButton = styled(PrimaryButton)<{ disabled?: boolean }>`
  border-radius: 12px;
  width: 200px;
  height: 48px;
  font-size: 16px;
  margin-left: auto;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 auto;
  `}
`
const Input = styled(InputField)`
  font-family: Inter;
  font-size: 1rem;
  color: #f2fbfb;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem !important;
  `}
`
export const ClaimButton = styled(MainButton)`
  width: 165px;
  height: 45px;
  font-size: 18px;
`
export const ClaimButtonDeus = styled(ClaimButton)`
  background: ${({ theme }) => theme.deusColor};
  color: #000;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.deusColorReverse};
    background: ${({ theme }) => theme.deusColorReverse};
  }
  &:hover {
    background: ${({ theme }) => theme.deusColorReverse};
  }
  ${({ theme, disabled }) =>
    disabled &&
    `
      background: ${theme.bg2};
      color: gray;
      border: 1px solid ${theme.border1};
      cursor: default;

      &:focus,
      &:hover {
        background: ${theme.bg2};
      }
  `}
`
const ErrorWrap = styled(Column)`
  gap: 20px;
  & > * {
    line-height: 25px;
  }
`
const ButtonsRow = styled(Row)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
    gap: 5px;
  `}
`
export const ConnectedButton = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  width: 126px;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  text-align: center;
  font-family: Inter;
  background: rgb(37, 43, 36);
  color: #66dd96;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 32px;
    width: 100px;
    border-radius: 8px;
    font-size: 14px;
  `}
`
const ButtonWrap = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin-left: auto;
  gap: 5px;
`
const MainButtonsWrap = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 5px;
`
const ExternalLinkIcon = styled(LinkIcon)`
  margin-left: 5px;
  margin-bottom: 4px;
  path {
    fill: #aaaeae;
  }
`
const ExternalItem = styled(RowStart)`
  border-bottom: 1px solid #aaaeae;
  &:hover {
    border-bottom: 1px solid white;
    & > * {
      color: ${({ theme }) => theme.white};
    }
    svg {
      path {
        fill: ${({ theme }) => theme.white};
      }
    }
  }
`

export enum ModalType {
  USDC,
  DEI,
}

export default function Incident() {
  const { account, chainId } = useWeb3React()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [userData, setUserData] = useState<any>(null)
  const [userReimbursableData, setUserReimbursableData] = useState<any>(null)
  const [error, setError] = useState(false)
  const toggleWalletModal = useWalletModalToggle()
  const [amountIn, setAmountIn] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [clickedOnce, setClickedOnce] = useState(false)
  const [modalType, setModalType] = useState(ModalType.USDC)

  const toggleModal = (action?: boolean) => {
    setIsOpen((prev) => !prev)
    setAmountIn('')
    if (action) {
      setModalType(ModalType.DEI)
    } else {
      setModalType(ModalType.USDC)
    }
  }
  const [isOpen2, setIsOpen2] = useState(false)
  const toggleModal2 = () => {
    setIsOpen2((prev) => !prev)
    setAmountIn('')
  }

  const rpcChangerCallback = useRpcChangerCallback()

  const [awaitingReimburseConfirmation, setAwaitingReimburseConfirmation] = useState(false)

  const { claimedDeusAmount, claimedCollateralAmount, claimableDeiAmount } = useGetClaimedData(walletAddress)

  const findUserLPData = useCallback(async () => {
    if (!walletAddress) return null
    try {
      const res = makeHttpRequest(`https://info.deus.finance/info/dei/userData/${walletAddress}`)
      return res
    } catch (error) {
      return null
    }
  }, [walletAddress])

  const findUserReimbursableData = useCallback(async () => {
    if (!walletAddress) return null
    try {
      const res = makeHttpRequest(`https://info.deus.finance/dei/proofs/${walletAddress}/`)
      return res
    } catch (error) {
      return null
    }
  }, [walletAddress])

  const handleCheck = useCallback(async () => {
    setClickedOnce(true)
    const rest = await findUserLPData()
    const rest2 = await findUserReimbursableData()
    if (rest?.status === 'error') {
      setError(true)
      setUserData(null)
    } else {
      setUserData(rest)
      setError(false)
    }
    if (rest2?.status === 'error') {
      setUserReimbursableData(null)
    } else {
      setUserReimbursableData(rest2)
    }
  }, [findUserLPData, findUserReimbursableData])

  useEffect(() => {
    if (account) {
      setWalletAddress(account)
      if (clickedOnce) handleCheck()
    }
  }, [account])

  const userReimbursableAmountBN = useMemo(() => {
    if (userReimbursableData?.data)
      return toBN(formatUnits(userReimbursableData?.data?.usdc.toString(), DEUS_TOKEN.decimals))
    return BN_ZERO
  }, [userReimbursableData])
  const userReimbursableAmount = userReimbursableAmountBN.minus(claimedCollateralAmount ?? BN_ZERO)

  const userDeusAmountBN = useMemo(() => {
    if (userReimbursableData?.data)
      return toBN(formatUnits(userReimbursableData?.data?.deus.toString(), DEUS_TOKEN.decimals))
    return BN_ZERO
  }, [userReimbursableData])
  const userDeusAmount = userDeusAmountBN.minus(claimedDeusAmount ?? BN_ZERO)

  const { reimburseRatio, deiReimburseRatio } = useGetReimburseRatio()
  const ratio = Number(reimburseRatio) * 1e-6
  const USDC_amount = userReimbursableAmount.times(toBN(ratio))
  const bDEI_amount = userReimbursableAmount.times(toBN(1 - ratio))

  const deiRatio = Number(deiReimburseRatio) * 1e-6
  const NewDei_amount = userReimbursableAmount.times(toBN(deiRatio))
  const bDEI_amount2 = userReimbursableAmount.times(toBN(1 - deiRatio))

  const {
    state: reimburseCallbackState,
    callback: reimburseCallback,
    error: reimburseCallbackError,
  } = useReimbursementCallback(
    amountIn,
    userReimbursableData?.data?.usdc.toString(),
    userReimbursableData?.usdc_proof,
    modalType
  )

  const {
    state: claimDeusCallbackState,
    callback: claimDeusCallback,
    error: claimDeusCallbackError,
  } = useClaimDeusCallback(amountIn, userReimbursableData?.data?.deus.toString(), userReimbursableData?.deus_proof)

  const handleReimburse = useCallback(async () => {
    console.log('called handleReimburse')
    console.log(reimburseCallbackState, reimburseCallbackError)
    if (!reimburseCallback) return
    try {
      setAwaitingReimburseConfirmation(true)
      const txHash = await reimburseCallback()
      setAwaitingReimburseConfirmation(false)
      console.log({ txHash })
      setIsOpen(false)
      setIsOpen2(false)
      setAmountIn('')
    } catch (e) {
      setAwaitingReimburseConfirmation(false)
      setIsOpen(false)
      setIsOpen2(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [reimburseCallbackState, reimburseCallbackError, reimburseCallback])

  const handleClaimDeus = useCallback(async () => {
    console.log('called handleClaimDeus')
    console.log(claimDeusCallbackState, claimDeusCallbackError)
    if (!claimDeusCallback) return
    try {
      setAwaitingReimburseConfirmation(true)
      const txHash = await claimDeusCallback()
      setAwaitingReimburseConfirmation(false)
      console.log({ txHash })
      setIsOpen(false)
      setIsOpen2(false)
      setAmountIn('')
    } catch (e) {
      setAwaitingReimburseConfirmation(false)
      setIsOpen(false)
      setIsOpen2(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [claimDeusCallbackState, claimDeusCallbackError, claimDeusCallback])

  return (
    <>
      <Container>
        <FormContainer>
          <FormHeader>DEI Snapshot 05.05.2023</FormHeader>
          <WalletAddressInputContainer>
            <Input
              value={walletAddress}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setWalletAddress(event.target.value)
                setError(false)
              }}
              placeholder="Wallet address"
            />
            <React.Fragment>
              <React.Fragment>
                {!account ? (
                  <React.Fragment>
                    <ConnectButtonWrap onClick={toggleWalletModal}>
                      <ConnectButton>
                        <ConnectButtonText>Connect Wallet</ConnectButtonText>
                      </ConnectButton>
                    </ConnectButtonWrap>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {chainId && chainId !== SupportedChainId.ARBITRUM ? (
                      <ClaimButton
                        onClick={() => {
                          setUserData(null)
                          setUserReimbursableData(null)
                          rpcChangerCallback(SupportedChainId.ARBITRUM)
                        }}
                      >
                        Switch to ARBITRUM
                      </ClaimButton>
                    ) : (
                      <ClaimButton
                        style={{ width: '120px' }}
                        onClick={() => {
                          handleCheck()
                        }}
                      >
                        Check
                      </ClaimButton>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            </React.Fragment>
          </WalletAddressInputContainer>

          {walletAddress && userReimbursableData && (
            <OutputContainer>
              <Row>
                <ExternalLink
                  href="https://docs.deus.finance/dei-incident-05.05.2023/reimbursement-process"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalItem>
                    <LinkTitle>Reimbursable Amount</LinkTitle>
                    <ExternalLinkIcon />
                    <LinkTitle>:</LinkTitle>
                  </ExternalItem>
                </ExternalLink>
                <Value>${userReimbursableAmount.toFixed(6).toString()}</Value>
              </Row>
              <Row>
                <Title>
                  Claimable amount in {USDC_TOKEN.name} + {BDEI_TOKEN.name}: (NOW)
                </Title>
                <Value>
                  {USDC_amount.toFixed(2).toString()} {USDC_TOKEN.symbol} + {bDEI_amount.toFixed(2).toString()}{' '}
                  {BDEI_TOKEN.symbol}
                </Value>
              </Row>
              <Row>
                <Title>
                  Claimable amount in {NEW_DEI_TOKEN.name} + {BDEI_TOKEN.name}: (Later)
                </Title>
                <Value>
                  {NewDei_amount.toFixed(2).toString()} DEI IOU + {bDEI_amount2.toFixed(2).toString()}{' '}
                  {BDEI_TOKEN.symbol}
                </Value>
              </Row>
              <Row>
                <Title>{NEW_DEI_TOKEN.name} IOU amount:</Title>
                <Value>
                  {claimableDeiAmount && claimableDeiAmount.isGreaterThan(BN_ZERO)
                    ? claimableDeiAmount.toFixed(3).toString()
                    : 0}{' '}
                  DEI IOU
                </Value>
              </Row>
              {userDeusAmount.isGreaterThan(BN_ZERO) && (
                <Row>
                  <Title>Claimable amount in {DEUS_TOKEN.name}: (NOW)</Title>
                  <Value>
                    {userDeusAmount.toFixed(3).toString()} {DEUS_TOKEN.name}
                  </Value>
                </Row>
              )}
              <ButtonsRow>
                <ExternalLink href="https://7eoku1wmhjg.typeform.com/dei-incident">
                  <NavButton style={{ width: '120px', padding: '5px 10px' }}>Report Issues</NavButton>
                </ExternalLink>
                {!account ? (
                  <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
                ) : walletAddress?.toLowerCase() === account?.toLowerCase() ? (
                  <ButtonWrap>
                    {userDeusAmount.isGreaterThan(BN_ZERO) && (
                      <ClaimButtonDeus onClick={() => toggleModal2()}>Claim DEUS</ClaimButtonDeus>
                    )}
                    <MainButtonsWrap>
                      <ClaimButton onClick={() => toggleModal()}>CLAIM NOW</ClaimButton>
                      <ClaimButton onClick={() => toggleModal(true)}>CLAIM DEI IOU</ClaimButton>
                    </MainButtonsWrap>
                  </ButtonWrap>
                ) : (
                  <ButtonWrap>
                    {userDeusAmount.isGreaterThan(BN_ZERO) && <ClaimButtonDeus disabled>Claim DEUS</ClaimButtonDeus>}
                    <ClaimButton disabled>CLAIM NOW</ClaimButton>
                    <ClaimButton disabled>CLAIM DEI IOU</ClaimButton>
                  </ButtonWrap>
                )}
              </ButtonsRow>
            </OutputContainer>
          )}

          {userData && <UserStats userData={userData} />}

          {error && (
            <>
              <ErrorWrap>
                <p>Wallet Address: {walletAddress}</p>
                <p>Snapshot Error: DEI Balance Not Found</p>
                <p>
                  The wallet you&#39;re trying to access has not been included in the snapshot dated 05.05.2023, as it
                  did not hold any DEI balances immediately before and during the incident.
                </p>
                <p>If you believe this is a mistake, please report an issue. </p>
              </ErrorWrap>
              {walletAddress && (
                <ExternalLink style={{ marginTop: '60px' }} href="https://7eoku1wmhjg.typeform.com/dei-incident">
                  <NavButton style={{ width: '200px', padding: '5px 10px' }}>Report Issues</NavButton>
                </ExternalLink>
              )}
            </>
          )}
        </FormContainer>
      </Container>
      <ReviewModal
        title={'Claim'}
        inputTokens={[DEI_BDEI_LP_TOKEN]}
        outputTokens={[modalType === ModalType.USDC ? USDC_TOKEN : NEW_DEI_TOKEN, BDEI_TOKEN]}
        amountIn={amountIn}
        setAmountIn={setAmountIn}
        userReimbursableData={userReimbursableAmount}
        isOpen={isOpen}
        toggleModal={toggleModal}
        buttonText={'Claim'}
        handleClick={() => handleReimburse()}
        ratio={modalType === ModalType.USDC ? ratio : deiRatio}
      />
      <ReviewModal2
        title={'Claim DEUS'}
        inputTokens={[DEUS_TOKEN]}
        outputTokens={[DEUS_TOKEN]}
        amountIn={amountIn}
        setAmountIn={setAmountIn}
        userDeusAmount={userDeusAmount}
        isOpen={isOpen2}
        toggleModal={toggleModal2}
        buttonText={'Claim DEUS'}
        handleClick={() => handleClaimDeus()}
      />
    </>
  )
}
