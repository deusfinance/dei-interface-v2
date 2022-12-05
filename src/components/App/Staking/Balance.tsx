import styled from 'styled-components'

const Container = styled.div`
  margin: 0 auto;
  margin-top: 12px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 340px;
  `}
  display: block;
  width: 100%;
`
const BalanceContent = styled.div`
  background-color: ${({ theme }) => theme.bg0};
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > p:first-of-type {
    color: white;
  }
  & > p:last-of-type {
    color: ${({ theme }) => theme.text2};
  }
  &:first-child {
    color: ${({ theme }) => theme.text2};
  }
  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  &:last-child {
    margin-top: 2px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    column-gap: 12px;
  }
`
const BalanceButton = styled.button`
  border-radius: 8px;
  width: 100%;
  border: ${({ theme }) => `1px solid ${theme.bg4}`};
  text-align: center;
  padding-block: 10px;
  background-color: ${({ theme }) => theme.bg2};
  font-size: 0.875rem;
  &:hover {
    background-color: ${({ theme }) => theme.bg1};
  }
`

const StackingBalance = () => {
  return (
    <Container>
      <BalanceContent>
        <p>Your DEUS-vDEUS LP balance :</p>
        <p>389.00 LP</p>
      </BalanceContent>
      <BalanceContent>
        <BalanceButton>Add liquidity</BalanceButton>
        <BalanceButton>Remove liquidity</BalanceButton>
      </BalanceContent>
    </Container>
  )
}
export default StackingBalance
