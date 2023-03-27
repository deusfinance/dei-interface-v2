import { StakingType } from 'constants/stakingPools'
import styled from 'styled-components'
import { Row, RowBetween } from 'components/Row'
import Link from 'next/link'
import Table from '../Stake/Table'

const Container = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg1};
  }
`
const Header = styled(RowBetween)`
  display: flex;
  flex-direction: column;
  font-family: 'Inter';
  padding: 20px 16px;
  align-items: flex-start;
  p {
    font-size: 16px;
    color: ${({ theme }) => theme.text1};
    }
  }
`

const Cell = styled.div<{ justify?: boolean }>`
  align-items: center;
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
`

const UpperRow = styled(RowBetween)`
  background: ${({ theme }) => theme.bg1};
  margin-top: 20px;
  margin-bottom: -10px;
  flex-wrap: wrap;
  width: 100%;
`

export interface StakingProps {
  stakings: StakingType[]
}

const UserStaking = ({ stakings }: StakingProps) => {
  function getUpperRow() {
    return (
      <UpperRow>
        <Row>
          <Cell style={{ height: 'fit-content', color: '#7F8082', textAlign: 'left', width: '25%' }}>Pair</Cell>
          <Cell style={{ height: 'fit-content', color: '#7F8082', width: '10%' }}>APR</Cell>
          <Cell style={{ height: 'fit-content', color: '#7F8082', width: '10%' }}>TVL</Cell>
          <Cell style={{ height: 'fit-content', color: '#7F8082', width: '15%' }}>My Staked LP</Cell>
          <Cell style={{ height: 'fit-content', color: '#7F8082', width: '15%' }}>My Reward</Cell>
          <Cell style={{ height: 'fit-content', color: '#7F8082', width: '25%' }}>Stake/Unstake</Cell>
        </Row>
      </UpperRow>
    )
  }

  return (
    <Container>
      <Header>
        <p>My LPs</p>
        {getUpperRow()}
      </Header>
      <Table stakings={stakings} hideFooter={true} />
    </Container>
  )
}

export default UserStaking
