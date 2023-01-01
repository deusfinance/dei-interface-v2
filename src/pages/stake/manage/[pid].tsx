// import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'

import { LiquidityPool as LiquidityPoolList } from 'constants/stakingPools'
import LiquidityPool from 'components/App/Staking/LiquidityPool'
import PoolInfo from 'components/App/Staking/PoolInfo'
import PoolShare from 'components/App/Staking/PoolShare'
import AvailableLP from 'components/App/Staking/AvailableLP'
import StakedLP from 'components/App/Staking/LPStaked'
import Reading from 'components/App/Staking/PoolDetails'
import BalanceToken from 'components/App/Staking/BalanceToken'
import { VStack } from 'components/App/Staking/common/Layout'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div<{ isMultipleColumns: boolean }>`
  display: ${({ isMultipleColumns }) => (isMultipleColumns ? 'grid' : 'flex')};
  grid-template-columns: 480px 480px;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   display: flex;
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

export default function StakingPage() {
  const router = useRouter()
  const { pid } = router.query
  const pidNumber = Number(pid)
  const pool = LiquidityPoolList.find((pool) => pool.id === pidNumber) || LiquidityPoolList[0]
  useWeb3NavbarOption({ network: true, wallet: true, stake: true })

  return (
    <Container style={{ marginTop: '16px' }}>
      <TopWrapper isMultipleColumns={pool?.tokens.length > 1}>
        {pool?.tokens.length > 1 && (
          <VStack style={{ width: '100%' }}>
            <BalanceToken pool={pool} />
            <LiquidityPool pool={pool} />
          </VStack>
        )}
        <div style={{ width: '100%' }}>
          <AvailableLP pool={pool} />
          <StakedLP pid={pidNumber} />
          <PoolShare pool={pool} />
          <PoolInfo pool={pool} />
          <Reading />
        </div>
      </TopWrapper>
    </Container>
  )
}
