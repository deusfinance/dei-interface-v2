import React, { useCallback, useEffect, useState } from 'react'

import { Container as MainContainer } from 'components/App/StableCoin'
import Column, { ColumnCenter } from 'components/Column'
import styled from 'styled-components'

import { InputField } from 'components/Input'
import { RowBetween } from 'components/Row'
import { BaseButton } from 'components/Button'

import useWeb3React from 'hooks/useWeb3'
import UserStats from './UserStats'
import { makeHttpRequest } from 'utils/http'
import { ExternalLink } from 'components/Link'
import { NavButton } from 'components/Button'

const Container = styled(MainContainer)`
  min-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  /* background: linear-gradient(90deg, #0baef422 0%, #30efe422 53.12%, #ff9af522 99.99%); */
`
const FormContainer = styled(ColumnCenter)`
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
  /* width: 720px;
  height: 510px; */
  /* background-color: #eee; */
  /* justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 400px;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 340px;
  `} */
`
const FormHeader = styled.div`
  margin-top: 50px;
  font-weight: 800;
  font-size: 32px;
  color: ${({ theme }) => theme.text1};
`
const WalletAddressInputContainer = styled(RowBetween)`
  margin-block: 34px;
  min-height: 60px;
  padding: 8px;
  background-color: #101010;
  border-radius: 12px;
  z-index: 2;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 45px;
    height: 45px;
  `}
`

const Button = styled(BaseButton)`
  height: 100%;
  background-image: linear-gradient(90deg, #f34038 0%, #ffb396 52.08%, #f78c2a 100%);
  color: #000;
  border-radius: 8px;
  width: 100px;
  font-size: 1rem;
  font-weight: 600;
  &:hover {
    outline-offset: 2px;
    outline: 2px #0badf4 solid;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.8rem !important;
  `}
`
const Input = styled(InputField)`
  font-size: 1rem;
  font-family: 'Noto Sans Mono';
  color: #777a7e;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.7rem !important;
  `}
`
const ErrorWrap = styled(Column)`
  gap: 20px;
  & > * {
    line-height: 25px;
  }
`
export default function Hack() {
  const { account } = useWeb3React()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<boolean>(false)

  const findUserLPData = useCallback(async () => {
    if (!walletAddress) return null
    try {
      const res = makeHttpRequest(`https://info.deus.finance/info/dei/userData/${walletAddress}`)
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
    if (rest?.status === 'error') {
      setError(true)
      setUserData(null)
    } else {
      setUserData(rest)
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
            placeholder="Enter wallet address"
          />
          <Button
            onClick={() => {
              handleCheck()
            }}
          >
            Check
          </Button>
        </WalletAddressInputContainer>

        {userData && <UserStats userData={userData} />}

        {error && (
          <ErrorWrap>
            <p>Wallet Address: {walletAddress}</p>
            <p>Snapshot Error: DEI Balance Not Found</p>
            <p>
              The wallet you&#39;re trying to access has not been included in the snapshot dated 05.05.2023, as it did
              not hold any DEI balances immediately before and during the incident.
            </p>
            <p>If you believe this is a mistake, please report an issue. </p>
          </ErrorWrap>
        )}

        {walletAddress && (
          <ExternalLink style={{ marginTop: '60px' }} href="https://7eoku1wmhjg.typeform.com/dei-incident">
            <NavButton style={{ width: '200px', padding: '5px 10px' }}>Report Issues</NavButton>
          </ExternalLink>
        )}
      </FormContainer>
    </Container>
  )
}
