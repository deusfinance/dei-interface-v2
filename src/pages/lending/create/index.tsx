import { useCallback, useState } from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
import { InputField, InputWrapper } from 'components/Input'
import Tableau from 'components/App/StableCoin/Tableau'

import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'
import { ConnectWallet, MainButton } from 'components/App/StableCoin'
import { DotFlashing } from 'components/Icons'
import useWeb3React from 'hooks/useWeb3'
import { useLendingCallback } from 'hooks/useLendingCallback'
import { PlusSquare } from 'react-feather'
import { useLendingImmutables, useUserDeployedLendingsCount } from 'hooks/useLendingPage'
import { useRouter } from 'next/router'
import { isAddress } from 'utils/validate'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: auto;
  background: ${({ theme }) => theme.bg2};
  padding: 25px 30px;
  margin-top: 20px;
  border-radius: 8px;

  & > * {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

const Item = styled.div`
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 4px;
  margin: 10px auto;
  padding: 10px;
  cursor: pointer;
`

export default function Create() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()

  const [name, setName] = useState('')
  const [rateContract, setRateContract] = useState<string>('')
  const [capManager, setCapManager] = useState<string>('')
  const [liquidationFee, setLiquidationFee] = useState('')

  const [immutables, setImmutables] = useState<string[]>([])
  const [immutable, setImmutable] = useState('')

  const [isBorrowerWhitelistActive, setIsBorrowerWhitelistActive] = useState(false)
  const [isLenderWhitelistActive, setIsLenderWhitelistActive] = useState(false)

  const [awaitingLendingConfirmation, setAwaitingLendingConfirmation] = useState(false)
  const [createdPool, setCreatedPool] = useState(true)

  const { immutablesEncoded } = useLendingImmutables(immutables)

  const {
    state: LendingCallbackState,
    callback: LendingCallback,
    error: LendingCallbackError,
  } = useLendingCallback(
    name,
    rateContract,
    capManager,
    immutablesEncoded,
    liquidationFee,
    isBorrowerWhitelistActive,
    isLenderWhitelistActive
  )

  const userDeployedLendingsCount = useUserDeployedLendingsCount()

  const handleCreateLending = useCallback(async () => {
    console.log('called handleCrateLending')
    console.log(LendingCallbackState, LendingCallbackError)
    if (!LendingCallback) return
    try {
      setAwaitingLendingConfirmation(true)
      const txHash = await LendingCallback()
      setAwaitingLendingConfirmation(false)
      // setCreatedPool(true)
      console.log({ txHash })
    } catch (e) {
      setAwaitingLendingConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [LendingCallback, LendingCallbackError, LendingCallbackState])

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    if (awaitingLendingConfirmation) {
      return (
        <MainButton>
          Creating {name} pool <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleCreateLending()}>Create Pool</MainButton>
  }

  function removeImmutable(immutableIndex: number) {
    const filteredArray = immutables.filter((_, index) => index !== immutableIndex)
    setImmutables(filteredArray)
  }

  function addImmutable(address: string) {
    if (immutable !== '' && isAddress(address)) setImmutables([...immutables, immutable])
  }

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <TopWrapper>
        <Tableau title={'Create Lending Pool'} imgSrc={MINT_IMG} />

        <InputWrapper>
          <div>Name:</div>
          <InputField
            title="Pool Name"
            autoFocus
            type="text"
            placeholder=""
            spellCheck="false"
            onBlur={(event: any) => setName(event.target.value)}
            style={{ marginLeft: '15px', fontSize: '16px' }}
          />
        </InputWrapper>

        <InputWrapper>
          <div>Rate Contract:</div>
          <InputField
            title="rateContract"
            type="text"
            placeholder=""
            spellCheck="false"
            onBlur={(event: any) => setRateContract(event.target.value)}
            style={{ marginLeft: '15px', fontSize: '16px' }}
          />
        </InputWrapper>

        <InputWrapper>
          <div>Cap Manager:</div>
          <InputField
            title="capManager"
            type="text"
            placeholder=""
            spellCheck="false"
            onBlur={(event: any) => setCapManager(event.target.value)}
            style={{ marginLeft: '15px', fontSize: '16px' }}
          />
        </InputWrapper>

        <InputWrapper>
          <div>Immutable:</div>
          <InputField
            title="Immutable"
            autoFocus
            type="text"
            placeholder=""
            spellCheck="false"
            onBlur={(event: any) => setImmutable(event.target.value)}
            style={{ marginLeft: '15px', fontSize: '16px' }}
          />
          <PlusSquare onClick={() => addImmutable(immutable)} color={'white'} style={{ cursor: 'pointer' }} />
        </InputWrapper>
        <div>
          {immutables.map((immutable, index) => (
            <Item key={index} onClick={() => removeImmutable(index)}>
              {index + 1}-{immutable}
            </Item>
          ))}
        </div>

        <InputWrapper>
          <div>Liquidation Fee:</div>
          <InputField
            title="LiquidationFee"
            type="number"
            placeholder=""
            spellCheck="false"
            onBlur={(event: any) => setLiquidationFee(event.target.value)}
            style={{ marginLeft: '15px', fontSize: '16px' }}
          />
        </InputWrapper>

        <InputWrapper>
          <div style={{ padding: '8px 0' }}>Borrower Whitelist Active:</div>
          <input
            type="checkbox"
            checked={isBorrowerWhitelistActive}
            onChange={() => setIsBorrowerWhitelistActive(!isBorrowerWhitelistActive)}
          />
        </InputWrapper>

        <InputWrapper>
          <div style={{ padding: '8px 0' }}>Lender Whitelist Active:</div>
          <input
            type="checkbox"
            checked={isLenderWhitelistActive}
            onChange={() => setIsLenderWhitelistActive(!isLenderWhitelistActive)}
          />
        </InputWrapper>

        <div style={{ marginTop: '20px' }}></div>
        {getActionButton()}

        {createdPool && (
          <MainButton onClick={() => router.push(`/lending/create/${Number(userDeployedLendingsCount) - 1}`)}>
            Go To Next Step
          </MainButton>
        )}
      </TopWrapper>
    </Container>
  )
}
