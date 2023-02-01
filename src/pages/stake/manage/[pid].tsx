import { useRouter } from 'next/router'
import styled from 'styled-components'

import { LiquidityPool as LiquidityPoolList, Stakings } from 'constants/stakingPools'

import { useWeb3NavbarOption } from 'state/web3navbar/hooks'

import LiquidityPool from 'components/App/Staking/LiquidityPool'
import PoolInfo from 'components/App/Staking/PoolInfo'
import PoolShare from 'components/App/Staking/PoolShare'
import AvailableLP from 'components/App/Staking/AvailableLP'
import StakedLP from 'components/App/Staking/LPStaked'
import BalanceToken from 'components/App/Staking/BalanceToken'
import { VStack } from 'components/App/Staking/common/Layout'
import { useMemo } from 'react'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div<{ isMultipleColumns: boolean }>`
  display: ${({ isMultipleColumns }) => (isMultipleColumns ? 'grid' : 'flex')};
  grid-template-columns: 480px 480px;
  min-width: 480px;
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
  const liquidityPool = LiquidityPoolList.find((pool) => pool.id === pidNumber) || LiquidityPoolList[0]
  const stakingPool = Stakings.find((p) => p.id === liquidityPool.id) || Stakings[0]

  const isSingleStakingPool = useMemo(() => {
    return stakingPool.isSingleStaking
  }, [stakingPool])

  useWeb3NavbarOption({ network: true, wallet: true, stake: true })

  return (
    <Container>
      <TopWrapper isMultipleColumns={!isSingleStakingPool}>
        {!isSingleStakingPool && (
          <VStack style={{ width: '100%' }}>
            <BalanceToken pool={liquidityPool} />
            <LiquidityPool pool={liquidityPool} />
          </VStack>
        )}
        <VStack style={{ width: '100%' }}>
          <AvailableLP pool={liquidityPool} />
          <StakedLP pid={pidNumber} />
          <PoolShare pool={liquidityPool} />
          <PoolInfo pool={liquidityPool} />
          {/* <Reading /> */}
        </VStack>
      </TopWrapper>
    </Container>
  )
}
