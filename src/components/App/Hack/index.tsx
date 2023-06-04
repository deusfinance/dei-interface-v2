import React, { useEffect, useState } from 'react'

import { Container as MainContainer } from 'components/App/StableCoin'
import { ColumnCenter } from 'components/Column'
import styled from 'styled-components'

import { InputField } from 'components/Input'
import { RowBetween } from 'components/Row'
import { BaseButton } from 'components/Button'

import LPsData from 'constants/files/deus-dei-lp-hack.json'
import { AddressZero } from '@ethersproject/constants'
import { isAddress } from 'utils/address'
import useWeb3React from 'hooks/useWeb3'
import { RESULT, TNotification, UserData, UserHackData } from './Types'
import { toBN } from 'utils/numbers'
// import { toBN } from 'utils/numbers'

const Container = styled(MainContainer)`
  min-height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &:before {
    position: absolute;
    width: 720px;
    height: 510px;
    content: '';
    background: linear-gradient(90deg, #0badf4 0%, #30efe4 53.12%, #ff9af5 99.99%);
    opacity: 0.1;
    filter: blur(120px);
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`
const FormContainer = styled(ColumnCenter)`
  width: 720px;
  height: 510px;
  /* background-color: #eee; */
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 400px;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 340px;
  `}
`
const FormHeader = styled.h2`
  font-weight: 500;
  font-size: 2rem;
  color: ${({ theme }) => theme.text1};
  margin-top: 2px;
  font-family: 'Space Grotesk';
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
  background-image: linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
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

const Notification = styled.p<{ type: RESULT }>`
  background: ${({ type }) =>
    type === RESULT.ELIGIBLE ? 'linear-gradient(90deg, #0BADF4 0%, #30EFE4 93.4%)' : '#F367E2'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`
const NotificationContainer = styled.p`
  text-align: center;
  font-size: 2rem;
  font-weight: medium;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 1rem;
    margin-top: -15px;
  `}
`

export default function Hack() {
  const { account } = useWeb3React()
  const [result, setResult] = useState<RESULT | undefined>(undefined)
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [data, setData] = useState<UserData[]>([])

  const eligibleContent: TNotification = { content: 'Your wallet is in snapshot', emoji: ' 🥳' }
  const notEligibleContent: TNotification = { content: 'Your wallet is not in snapshot', emoji: ' 😖' }

  useEffect(() => {
    if (account) {
      setWalletAddress(account)
      findUserLPData(account)
    }
  }, [account])

  useEffect(() => {
    if (!isAddress(walletAddress) || walletAddress === AddressZero) {
      setResult(undefined)
    }
  }, [walletAddress])

  function findUserLPData(walletAddress: string): void {
    const AllData: UserHackData[] = LPsData as unknown as UserHackData[]
    const data: UserData[] = []
    for (let i = 0; i < AllData.length; i++) {
      const lpData = AllData[i]

      if (lpData.user.toLowerCase() === walletAddress.toLowerCase()) {
        setResult(RESULT.ELIGIBLE)
        const userData: UserHackData = lpData

        for (const key in userData) {
          if (Object.prototype.hasOwnProperty.call(userData, key)) {
            // console.log(key, userData[key as keyof UserHackData])
            const rowValue = userData[key as keyof UserHackData]
            if (!toBN(rowValue).isEqualTo(0) && key !== 'name' && key !== 'user' && key !== 'is_contract')
              data.push({ key, value: rowValue })
          }
        }

        console.log(data)
        setData(data)
        return
      } else {
        setResult(RESULT.NOT_ELIGIBLE)
      }
    }
  }

  return (
    <Container>
      <FormContainer>
        <FormHeader>Hack</FormHeader>
        <WalletAddressInputContainer>
          <Input
            value={walletAddress}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(event.target.value)}
            placeholder="Enter wallet address"
          />
          <Button
            onClick={() => {
              findUserLPData(walletAddress)
            }}
          >
            Check
          </Button>
        </WalletAddressInputContainer>
        {result === RESULT.ELIGIBLE ? (
          <div>
            <NotificationContainer>
              <Notification type={RESULT.NOT_ELIGIBLE}>{notEligibleContent.content}</Notification>
              {notEligibleContent.emoji}
            </NotificationContainer>
            {data.map((d: UserData, index) => (
              <div key={index}>{`${d.key}: ${d.value}`}</div>
            ))}
          </div>
        ) : result === RESULT.NOT_ELIGIBLE ? (
          <NotificationContainer>
            <Notification type={RESULT.NOT_ELIGIBLE}>{notEligibleContent.content}</Notification>
            {notEligibleContent.emoji}
          </NotificationContainer>
        ) : null}
      </FormContainer>
    </Container>
  )
}
