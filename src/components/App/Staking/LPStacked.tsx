import { InputField } from 'components/Input'
import styled from 'styled-components'
import Container from './common/Container'
import { Divider, HStack } from './common/Layout'

const Wrapper = styled(HStack)`
  justify-content: space-between;
  padding: 12px;
  min-height: 50px;
`
const StackedLPHeader = styled(Wrapper)`
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  & > p {
    color:${({ theme }) => theme.text1}
    font-size: 0.875rem;
    font-weight: medium;
  }
`
const StackedLPReward = styled(Wrapper)`
  background-color: ${({ theme }) => theme.bg1};
  p {
    &:first-of-type {
      color: ${({ theme }) => theme.text2};
      margin-right: 4px;
      color: #8f939c;
    }
    &:not(p:first-of-type) {
      background: -webkit-linear-gradient(left, #0badf4 0%, #30efe4 93.4%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    font-size: 1rem;
    font-weight: medium;
  }
`
const BaseButton = styled.button`
  height: 36px;
  width: 104px;
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  & > span {
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    & > p {
      font-size: 0.875rem;
      font-weight: bold;
    }
  }
`
const StackedLPRewardButton = styled(BaseButton)`
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  & > span {
    background-color: ${({ theme }) => theme.bg0};
    & > p {
      background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
`
const UnStackedContainer = styled(Wrapper)`
  background-color: ${({ theme }) => theme.bg2};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  padding-block: 8px;
`

const UnstackedInput = styled(InputField)`
  background-color: transparent;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: medium;
`
const UnStackedButton = styled(BaseButton)`
  background: #8f939c;
  & > span {
    background-color: ${({ theme }) => theme.bg0};
    & > p {
      color: ${({ theme }) => theme.text1};
    }
  }
`
const StackedLP = () => {
  return (
    <Container>
      <>
        <StackedLPHeader>
          <p>LP Staked:</p>
          <p>488.335</p>
        </StackedLPHeader>
        <Divider backgroundColor="#101116" />
        <StackedLPReward>
          <HStack>
            <p>Reward: </p>
            <p>0.029 DEUS</p>
          </HStack>
          <StackedLPRewardButton>
            <span>
              <p>Claim</p>
            </span>
          </StackedLPRewardButton>
        </StackedLPReward>
        <Divider backgroundColor="#101116" />
        <UnStackedContainer>
          <UnstackedInput placeholder="Enter amount" />
          <UnStackedButton>
            <span>
              <p>Unstake</p>
            </span>
          </UnStackedButton>
        </UnStackedContainer>
      </>
    </Container>
  )
}

export default StackedLP
