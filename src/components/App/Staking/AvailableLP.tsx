import { PrimaryButton } from 'components/Button'
import { InputField } from 'components/Input'
import styled from 'styled-components'
import Container from './common/Container'
import { Divider, HStack } from './common/Layout'

const Wrapper = styled(HStack)`
  justify-content: space-between;
  padding: 12px;
  min-height: 50px;
`

const AvailableLPHeader = styled(Wrapper)`
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  & > p {
    font-size: 0.875rem;
    font-weight: medium;
    &:last-of-type {
      color: ${({ theme }) => theme.text2};
    }
  }
`
const AvailableLPContent = styled(Wrapper)`
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg2};
  padding-block: 0px;
  column-gap: 4px;
`
const AmountInput = styled(InputField)`
  background-color: transparent;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: medium;
`
const StakeButton = styled(PrimaryButton)`
  height: 36px !important;
  width: 104px !important;
  font-size: 0.875rem;
  font-weight: bold;
  backdrop-filter: blur(9px);
  border-radius: 8px;
`

const AvailableLP = () => {
  return (
    <Container>
      <>
        <AvailableLPHeader>
          <p>LP Available:</p>
          <p>0.00</p>
        </AvailableLPHeader>
        <Divider backgroundColor="#101116" />
        <AvailableLPContent>
          <AmountInput placeholder="Enter amount" />
          <StakeButton
            onClick={() => {
              console.log('')
            }}
          >
            Stake
          </StakeButton>
        </AvailableLPContent>
      </>
    </Container>
  )
}

export default AvailableLP
