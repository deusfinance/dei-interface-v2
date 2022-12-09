import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
  margin-top: 12px;
  display: block;
  width: 100%;
`

const Wrapper = styled(Container)`
  margin-top: 12px;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 340px;
  `}
  overflow: hidden;
`
const BoxContent = styled.p`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 15px;
  &:first-child {
    background: ${({ theme }) => theme.bg2};
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  &:last-child {
    background-color: ${({ theme }) => theme.bg0};
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`
interface IContentValue {
  isGray?: boolean
}
const ContentValue = styled.p<IContentValue>`
  padding: 6px 0px;
  color: ${({ theme, isGray }) => (isGray ? theme.text2 : 'white')};
`
const Reward = styled(ContentValue)`
  color: #30efe4;
  margin-left: 10px;
`
const ClaimRewardButton = styled.button`
  background-image: -webkit-linear-gradient(right, #0badf4, #30efe4);
  padding: 1px 1px;
  border-radius: 6px;
  width: 60px;
  & > span {
    background-color: ${({ theme }) => theme.bg0};
    height: 100%;
    width: 100%;
    display: inline-block;
    border-radius: 6px;

    & > p {
      background-image: -webkit-linear-gradient(right, #0badf4, #30efe4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
    }
  }
`

const Amount = () => {
  return (
    <Container>
      <Wrapper>
        <BoxContent>
          <ContentValue>Your Staked Amount</ContentValue>
          <ContentValue isGray>0.00 vDEUS</ContentValue>
        </BoxContent>
        <BoxContent>
          <div style={{ display: 'flex' }}>
            <ContentValue>Reward:</ContentValue>
            <Reward>0.00 DEUS</Reward>
          </div>
          <ClaimRewardButton
            onClick={() => {
              console.log('')
            }}
          >
            <span>
              <p>Claim</p>
            </span>
          </ClaimRewardButton>
        </BoxContent>
      </Wrapper>
    </Container>
  )
}

export default Amount
