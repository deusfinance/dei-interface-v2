import { InputField } from 'components/Input'
import styled from 'styled-components'
import Container from './common/Container'
import { Divider, HStack } from './common/Layout'

const Wrapper = styled(HStack)`
  justify-content: space-between;
  padding: 12px;
  min-height: 50px;
`
const StakedLPHeader = styled(Wrapper)`
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
  & > p {
    color:${({ theme }) => theme.text1}
    font-size: 0.875rem;
    font-weight: medium;
  }
`
const StakedLPReward = styled(Wrapper)<{ disabled?: boolean }>`
  background-color: ${({ theme }) => theme.bg1};
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
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
const StakedLPRewardButton = styled(BaseButton)`
  background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
  border-radius: 8px;
  & > span {
    background-color: ${({ theme }) => theme.bg0};
    & > p {
      background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
`
const UnStakedContainer = styled(Wrapper)`
  background-color: ${({ theme }) => theme.bg2};
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
  padding-block: 8px;
`

const UnStakedInput = styled(InputField)`
  background-color: transparent;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: medium;
`
const UnStakedButton = styled(BaseButton)`
  background: #8f939c;
  border-radius: 8px;
  & > span {
    background-color: ${({ theme }) => theme.bg0};
    & > p {
      color: ${({ theme }) => theme.text1};
    }
  }
`
const StakedLP = () => {
  const rewardAmount = 0.028

  return (
    <Container>
      <>
        <StakedLPHeader>
          <p>LP Staked:</p>
          <p>488.335</p>
        </StakedLPHeader>
        <Divider backgroundColor="#101116" />
        <StakedLPReward disabled={!rewardAmount}>
          <HStack>
            <p>Reward: </p>
            <p>{rewardAmount} DEUS</p>
          </HStack>
          <StakedLPRewardButton
            onClick={() => {
              console.log('')
            }}
          >
            <span>
              <p>Claim</p>
            </span>
          </StakedLPRewardButton>
        </StakedLPReward>
        <Divider backgroundColor="#101116" />
        <UnStakedContainer>
          <UnStakedInput placeholder="Enter amount" />
          <UnStakedButton
            onClick={() => {
              console.log('')
            }}
          >
            <span>
              <p>Unstake</p>
            </span>
          </UnStakedButton>
        </UnStakedContainer>
      </>
    </Container>
  )
}

export default StakedLP
