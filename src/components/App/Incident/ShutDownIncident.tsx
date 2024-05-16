import React from 'react'
import styled from 'styled-components'

import { Container as MainContainer } from 'components/App/StableCoin'
import Column, { ColumnCenter } from 'components/Column'
import { InputField } from 'components/Input'
import { RowBetween } from 'components/Row'
import { PrimaryButton } from 'components/Button'
import useWeb3React from 'hooks/useWeb3'
import { ExternalLink } from 'components/Link'

const Container = styled(MainContainer)`
  min-height: 90vh;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  position: relative;
  font-family: Inter;
`
const FormContainer = styled(ColumnCenter)`
  align-items: flex-start;
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
const FormSubHeader = styled(FormHeader)`
  font-size: 25px;
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
export const Title = styled.span``
export const LinkTitle = styled(Title)`
  &:hover {
    color: white;
  }
`
export const Value = styled.span`
  margin-left: auto;
  margin-right: 6px;
  color: #aaaeae;
`
export const MainButton = styled(PrimaryButton)<{ disabled?: boolean }>`
  border-radius: 12px;
  width: 200px;
  height: 48px;
  font-size: 16px;
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
  background: ${({ theme }) => theme.primary6};
  width: 342px;
  height: 48px;
  font-size: 18px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: auto;
    height: 42px;
    font-size: 12px;
  `}

  ${({ disabled }) =>
    disabled &&
    `
      border: none;
  `}
`
export const CheckButton = styled(ClaimButton)<{ inert?: boolean }>`
  /* background: ${({ theme, inert }) => (inert ? theme.bg2 : theme.specialBG1)}; */
  background: ${({ theme }) => theme.specialBG1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 35px;
  `}
`
export const ClaimButtonDeus = styled(ClaimButton)`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.text3};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.deusColorReverse};
    background: ${({ theme }) => theme.deusColorReverse};
  }
  &:hover {
    background: ${({ theme }) => theme.deusColorReverse};
    color: #000;
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
        color: gray;
      }
  `}
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
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 32px;
    width: 100px;
    border-radius: 8px;
    font-size: 14px;
  `}
`
const DisclaimerWrap = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
  margin-left: 0;
  margin-right: auto;
  & > p {
    padding-top: 6px;
  }
`

export default function ShutDownIncident() {
  const { account, chainId } = useWeb3React()

  return (
    <Container>
      <FormContainer>
        <FormHeader>The DEI Incident page and reimbursement contracts were shut down on May 15, 2024.</FormHeader>
        <FormSubHeader>What Happens with Unclaimed Allocations?</FormSubHeader>
        <p>
          Unclaimed allocations will be automatically converted to DEI-IOU and airdropped directly to all users who did
          not claim before May 15. This process will be completed by the end of May 2024,
        </p>
        <FormSubHeader>Why was this decision made?</FormSubHeader>
        <p>
          as announced in the DEUS Discord on May 10, 2024{' '}
          <ExternalLink
            style={{ color: '#6161e4' }}
            href={'https://discord.com/channels/746652484382228480/895295996672745502/1238483197923168276'}
          >
            (Discord Link)
          </ExternalLink>
          . This decision was made to streamline the process and ensure a smooth transition to $BOOST for all users.
          DEI-IOU received via airdrop can be converted into $BOOST at relaunch.
        </p>
        <p>(The relaunch date of $BOOST and $DEUS is still TBD.)</p>
        <FormSubHeader>What If You Want to Reverse This Decision?</FormSubHeader>
        <p>
          If you wish to reverse this decision, you can forego your rights to receiving $BOOST at relaunch and claim the
          USDC backing instead.
        </p>
        <p>
          To do this, wait until you receive your DEI-IOU in your wallet at the end of May via the airdrop and then send
          them to the DEUS multi-sig on Arbitrum:
        </p>
        <ExternalLink
          style={{ color: '#6161e4' }}
          href={'https://arbiscan.io/address/0x7f5ae1dc8d2b5d599409c57978d21cf596d37996'}
        >
          https://arbiscan.io/address/0x7f5ae1dc8d2b5d599409c57978d21cf596d37996
        </ExternalLink>

        <FormSubHeader>What Happens with the Unclaimed Backing in the Meantime?</FormSubHeader>
        <p>
          As previously announced in Discord on May 10, 2024, at 15:30{' '}
          <ExternalLink
            style={{ color: '#6161e4' }}
            href={'https://discord.com/channels/746652484382228480/895295996672745502/1238483197923168276'}
          >
            (Discord Link)
          </ExternalLink>
          , the remaining $BOOST USDC (2.7 million USDC) backing is now invested in app.backed.ventures, earning a 52%
          APR in cash and proportionally in Ethena Sats and Blast points, as well as BACKED particles (which can later
          be swapped into $BACKED tokens). These earnings will be used to increase the backing of $BOOST from 85% to
          100%. Any additional profits will also be paid out to $BOOST holders.
        </p>
        <p>
          If you have more questions about that, join the DEUS discord and, navigate to the #reimbursement-discussion
          channel, and speak to a community admin.
        </p>
      </FormContainer>
    </Container>
  )
}
