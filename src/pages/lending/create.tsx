import { useState } from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
import { InputField, InputWrapper } from 'components/Input'

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

export default function Create() {
  const [name, setName] = useState()
  const [rateContract, setRateContract] = useState()
  const [liquidtationFee, setLiquidationFee] = useState()

  const [isBorrowerWhitelistActive, setIsBorrowerWhitelistActive] = useState(false)
  const [isLenderWhitelistActive, setIsLenderWhitelistActive] = useState(false)
  console.log({ name, rateContract, liquidtationFee, isBorrowerWhitelistActive, isLenderWhitelistActive })

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <TopWrapper>
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
            title="Pool Name"
            autoFocus
            type="text"
            placeholder=""
            spellCheck="false"
            onBlur={(event: any) => setRateContract(event.target.value)}
            style={{ marginLeft: '15px', fontSize: '16px' }}
          />
        </InputWrapper>
        <InputWrapper>
          <div>Liquidation Fee:</div>
          <InputField
            title="Pool Name"
            autoFocus
            type="number"
            placeholder=""
            spellCheck="false"
            onBlur={(event: any) => setLiquidationFee(event.target.value)}
            style={{ marginLeft: '15px', fontSize: '16px' }}
          />
        </InputWrapper>
        <InputWrapper>
          <div>Borrower Whitelist Active:</div>
          <input
            type="checkbox"
            checked={isBorrowerWhitelistActive}
            onChange={() => setIsBorrowerWhitelistActive(!isBorrowerWhitelistActive)}
          />
        </InputWrapper>
        <InputWrapper>
          <div>Lender Whitelist Active:</div>
          <input
            type="checkbox"
            checked={isLenderWhitelistActive}
            onChange={() => setIsLenderWhitelistActive(!isLenderWhitelistActive)}
          />
        </InputWrapper>
      </TopWrapper>

      <Disclaimer />
    </Container>
  )
}
