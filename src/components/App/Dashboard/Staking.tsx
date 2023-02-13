import { StakingType } from 'constants/stakingPools'
import styled from 'styled-components'
import { RowBetween } from 'components/Row'
import Link from 'next/link'
import Table from './Table'

const Container = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg1};
  padding: 12px 24px;
  tr {
    border-radius: 12px;
    margin-bottom: 12px;
    background-color: ${({ theme }) => theme.bg3} !important;
    ${({ theme }) => theme.mediaWidth.upToSmall`
    background-color: transparent !important;
  `};
  }
`
const Header = styled(RowBetween)`
  margin-top: 8px;
  margin-bottom: 20px;
  font-family: 'Inter';
  p {
    font-size: 20px;
    color: ${({ theme }) => theme.text1};
  }
  a {
    font-size: 12px;
    color: ${({ theme }) => theme.bg6};
    font-weight: 600;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`

export interface StakingProps {
  stakings: StakingType[]
}

const Staking = ({ stakings }: StakingProps) => {
  return (
    <Container>
      <Header>
        <p>My Stakings</p>
        <Link href="/stake">View All</Link>
      </Header>
      <Table stakings={stakings} />
    </Container>
  )
}

export default Staking
