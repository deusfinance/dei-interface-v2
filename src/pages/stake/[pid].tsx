import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { LiquidityPool, Stakings } from 'constants/stakingPools'
import StakingAmount from 'components/App/Staking/Amount'
import StakingBalance from 'components/App/Staking/Balance'
import StakingDetails from 'components/App/Staking/PoolDetails'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

export default function StakingPage() {
  useWeb3NavbarOption({ network: true, wallet: true })
  const router = useRouter()
  const { pid } = router.query
  const pidNumber = Number(pid)
  const pool = Stakings.find((pool) => pool.id === pidNumber) || Stakings[0]
  const liquidityPool = LiquidityPool.find((p) => p.id === pool.id) || LiquidityPool[0]

  const items = useMemo(
    () => [
      { name: 'APR', value: '4%' },
      { name: 'TVL', value: '$4.58m' },
      { name: 'Total Staked', value: `3,120.00 ${liquidityPool?.lpToken?.symbol}` },
    ],
    [liquidityPool?.lpToken?.symbol]
  )

  return (
    <Container>
      <TopWrapper>
        <StakingAmount />
        {/* <StakingPool pool={pool} /> */}
        <StakingBalance />
        <StakingDetails />
      </TopWrapper>
    </Container>
  )
}
