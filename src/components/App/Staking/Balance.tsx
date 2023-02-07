import { useRouter } from 'next/router'
import styled from 'styled-components'
import Container from './common/Container'

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

const StakingBalance = () => {
  const router = useRouter()
  const { pid } = router.query

  return (
    <Container>
      <>
        <BalanceContent>
          <p>Your DEUS-xDEUS LP balance :</p>
          <p>389.00 LP</p>
        </BalanceContent>
        <BalanceContent>
          <BalanceButton onClick={() => router.push(`/stake/manage/${pid}?action=add`)}>Add liquidity</BalanceButton>
          <BalanceButton onClick={() => router.push(`/stake/manage/${pid}?action=remove`)}>
            Remove liquidity
          </BalanceButton>
        </BalanceContent>
      </>
    </Container>
  )
}
export default StakingBalance
