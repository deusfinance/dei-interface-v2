import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Container as MainContainer } from 'components/App/StableCoin'
import Column, { ColumnCenter } from 'components/Column'
import { InputField } from 'components/Input'
import { Row, RowBetween } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import useWeb3React from 'hooks/useWeb3'
import UserStats from './UserStats'
import { makeHttpRequest } from 'utils/http'
import { ExternalLink } from 'components/Link'
import { NavButton } from 'components/Button'
import { useWalletModalToggle } from 'state/application/hooks'
import ReviewModal from './ReviewModal'
import ReviewModal2 from './ReviewModal2'
import { BDEI_TOKEN, DEI_BDEI_LP_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { formatUnits } from '@ethersproject/units'
import { BN_ZERO, toBN } from 'utils/numbers'
import { DeusText } from '../Redemption/InputBoxInDollar'
import { useClaimDeusCallback, useReimbursementCallback } from 'hooks/useReimbursementCallback'
import { useGetClaimedData } from 'hooks/useReimbursementPage'

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
  /* ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 45px;
    height: 45px;
  `} */
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
  /* ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 45px;
    height: 45px;
  `} */
`
export const Title = styled.span`
  color: #aaaeae;
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
`
const Input = styled(InputField)`
  font-family: Inter;
  font-size: 1rem;
  color: #f2fbfb;
  /* ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.7rem !important;
  `} */
`
export const ClaimButton = styled(MainButton)`
  width: 260px;
  height: 45px;
  font-size: 18px;
`
export const ClaimButtonDeus = styled(ClaimButton)`
  width: 140px;
  background: ${({ theme }) => theme.deusColor};
  color: #000;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.deusColorReverse};
    background: ${({ theme }) => theme.deusColorReverse};
  }
  &:hover {
    background: ${({ theme }) => theme.deusColorReverse};
  }
`
const ErrorWrap = styled(Column)`
  gap: 20px;
  & > * {
    line-height: 25px;
  }
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
`
const ButtonWrap = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin-left: auto;
  gap: 5px;
`

export default function Incident() {
  const { account } = useWeb3React()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [userData, setUserData] = useState<any>(null)
  const [userReimbursableData, setUserReimbursableData] = useState<any>(null)
  const [error, setError] = useState<boolean>(false)
  const toggleWalletModal = useWalletModalToggle()
  const [amountIn, setAmountIn] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const toggleModal = () => setIsOpen((prev) => !prev)
  const [isOpen2, setIsOpen2] = useState(false)
  const toggleModal2 = () => setIsOpen2((prev) => !prev)

  const [awaitingReimburseConfirmation, setAwaitingReimburseConfirmation] = useState(false)

  const { claimedDeusAmount, claimedCollateralAmount } = useGetClaimedData()

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

  useEffect(() => {
    if (account) setWalletAddress(account)
  }, [account])

  const handleCheck = async () => {
    const rest = await findUserLPData()
    const rest2 = await findUserReimbursableData()
    if (rest?.status === 'error' || rest2?.status === 'error') {
      setError(true)
      setUserData(null)
      setUserReimbursableData(null)
    } else {
      setUserData(rest)
      setUserReimbursableData(rest2)
      setError(false)
    }
  }

  useEffect(() => {
    if (account) {
      setWalletAddress(account?.toString())
      handleCheck()
    }
  }, [account])

  // console.log({ userReimbursableData })

  // function findUserLPData(walletAddress: string): void {
  //   const AllData = LPsData as unknown as { [key: string]: any }
  //   const userData = AllData[walletAddress.toLowerCase()] ?? null
  //   setUserData(userData)
  //   return userData
  // }

  // const InputAmount = useMemo(() => {
  //   return tryParseAmount(amountIn, deiCurrency || undefined)
  // }, [amountIn, deiCurrency])

  const userReimbursableAmountBN = useMemo(() => {
    if (userReimbursableData) return toBN(formatUnits(userReimbursableData?.data?.usdc.toString(), DEUS_TOKEN.decimals))
    return BN_ZERO
  }, [userReimbursableData])
  const userReimbursableAmount = userReimbursableAmountBN.minus(claimedCollateralAmount)

  const userDeusAmountBN = useMemo(() => {
    if (userReimbursableData) return toBN(formatUnits(userReimbursableData?.data?.deus.toString(), DEUS_TOKEN.decimals))
    return BN_ZERO
  }, [userReimbursableData])
  const userDeusAmount = userDeusAmountBN.minus(claimedDeusAmount)

  // console.log(claimedDeusAmount, claimedCollateralAmount)
  // console.log(userReimbursableAmount, userDeusAmount)

  const {
    state: reimburseCallbackState,
    callback: reimburseCallback,
    error: reimburseCallbackError,
  } = useReimbursementCallback(amountIn, userReimbursableAmount?.toString(), userReimbursableData?.usdc_proof)

  const {
    state: claimDeusCallbackState,
    callback: claimDeusCallback,
    error: claimDeusCallbackError,
  } = useClaimDeusCallback(amountIn, userDeusAmount?.toString(), userReimbursableData?.deus_proof)

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
            {!account ||
            walletAddress?.toLowerCase() !== account?.toLowerCase() ||
            !userData ||
            !userReimbursableData ? (
              <ClaimButton
                style={{ width: '120px' }}
                onClick={() => {
                  handleCheck()
                }}
              >
                Check
              </ClaimButton>
            ) : (
              <ConnectedButton>Connected</ConnectedButton>
            )}
          </WalletAddressInputContainer>

          {walletAddress && userReimbursableData && (
            <OutputContainer>
              <Row>
                <Title>
                  Reimbursable Amount ({USDC_TOKEN.name}-{BDEI_TOKEN.name}):
                </Title>
                <Value>${userReimbursableAmount.toString()}</Value>
              </Row>
              {userReimbursableData?.data?.deus !== '0' && (
                <Row>
                  <Title>{DEUS_TOKEN.name} Amount:</Title>
                  <Value>
                    {toBN(formatUnits(userReimbursableData?.data?.deus.toString(), DEUS_TOKEN.decimals))
                      .toFixed(3)
                      .toString()}
                    <DeusText>DEUS</DeusText>
                  </Value>
                </Row>
              )}
              <Row>
                <ExternalLink href="https://7eoku1wmhjg.typeform.com/dei-incident">
                  <NavButton style={{ width: '200px', padding: '5px 10px' }}>Report Issues</NavButton>
                </ExternalLink>
                {!account ? (
                  <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
                ) : walletAddress?.toLowerCase() === account?.toLowerCase() ? (
                  <ButtonWrap>
                    {userReimbursableData?.data?.deus !== '0' && (
                      <ClaimButtonDeus onClick={() => toggleModal2()}>Claim DEUS</ClaimButtonDeus>
                    )}
                    <ClaimButton onClick={() => toggleModal()}>Claim</ClaimButton>
                  </ButtonWrap>
                ) : (
                  <ButtonWrap>
                    {userReimbursableData?.data?.deus !== '0' && <ClaimButtonDeus disabled>Claim DEUS</ClaimButtonDeus>}
                    <ClaimButton disabled>Claim</ClaimButton>
                  </ButtonWrap>
                )}
              </Row>
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
        outputTokens={[USDC_TOKEN, BDEI_TOKEN]}
        amountIn={amountIn}
        setAmountIn={setAmountIn}
        userReimbursableData={userReimbursableAmount?.toString()}
        isOpen={isOpen}
        toggleModal={toggleModal}
        buttonText={'Claim'}
        handleClick={() => handleReimburse()}
      />
      <ReviewModal2
        title={'Claim'}
        inputTokens={[DEUS_TOKEN]}
        outputTokens={[DEUS_TOKEN]}
        amountIn={amountIn}
        setAmountIn={setAmountIn}
        userDeusAmount={userDeusAmount?.toString()}
        isOpen={isOpen2}
        toggleModal={toggleModal2}
        buttonText={'Claim'}
        handleClick={() => handleClaimDeus()}
      />
    </>
  )
}
