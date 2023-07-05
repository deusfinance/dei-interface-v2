import React, { useCallback, useEffect, useState } from 'react'
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
import { DEI_BDEI_LP_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'

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
  font-size: 1rem;
  font-family: Inter;
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

  // function findUserLPData(walletAddress: string): void {
  //   const AllData = LPsData as unknown as { [key: string]: any }
  //   const userData = AllData[walletAddress.toLowerCase()] ?? null
  //   setUserData(userData)
  //   return userData
  // }

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
                  Reimbursable Amount ({USDC_TOKEN.name}-{DEUS_TOKEN.name}):
                </Title>
                <Value>12,233,263</Value>
              </Row>
              <Row>
                <ExternalLink href="https://7eoku1wmhjg.typeform.com/dei-incident">
                  <NavButton style={{ width: '200px', padding: '5px 10px' }}>Report Issues</NavButton>
                </ExternalLink>
                {!account ? (
                  <MainButton onClick={toggleWalletModal}>Connect Wallet</MainButton>
                ) : walletAddress?.toLowerCase() === account?.toLowerCase() ? (
                  <ClaimButton onClick={() => toggleModal()}>Claim</ClaimButton>
                ) : (
                  <ClaimButton disabled>Claim</ClaimButton>
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
        outputTokens={[USDC_TOKEN, DEUS_TOKEN]}
        amountIn={amountIn}
        setAmountIn={setAmountIn}
        userReimbursableData={userReimbursableData}
        isOpen={isOpen}
        toggleModal={toggleModal}
        buttonText={'Claim'}
        handleClick={() => console.log('test2')}
      />
    </>
  )
}
