import { useRouter } from 'next/router'
import styled from 'styled-components'
import { LiquidityPool, Stakings } from 'constants/stakingPools'
import StakingAmount from 'components/App/Staking/Amount'
import StakingBalance from 'components/App/Staking/Balance'
import StakingDetails from 'components/App/Staking/PoolDetails'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import StakingPool from 'components/App/Staking/StakingPool'
import { useCustomCoingeckoPrice } from 'hooks/useCoingeckoPrice'
import { usePoolBalances } from 'hooks/useStablePoolInfo'
import { formatDollarAmount } from 'utils/numbers'

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
  const stakingPool = Stakings.find((pool) => pool.id === pidNumber) || Stakings[0]
  const liquidityPool = LiquidityPool.find((p) => p.id === stakingPool.id) || LiquidityPool[0]

  const poolBalances = usePoolBalances(liquidityPool)
  // FIXME: check this for single stakings
  const totalLockedValue =
    poolBalances[1] * 2 * Number(useCustomCoingeckoPrice(liquidityPool.priceToken?.symbol ?? 'DEI'))

  // generate total APR if pools have secondary APRs
  const primaryApy = stakingPool.aprHook(stakingPool)
  const secondaryApy = stakingPool.hasSecondaryApy ? stakingPool.secondaryAprHook(liquidityPool, stakingPool) : 0
  const totalApy = primaryApy + secondaryApy

  // generate respective tooltip info if pools have more than 1 reward tokens
  const primaryTooltipInfo = primaryApy.toFixed(0) + '% ' + stakingPool.rewardTokens[0].symbol
  const secondaryTooltipInfo = stakingPool.hasSecondaryApy
    ? ' + ' + secondaryApy.toFixed(0) + '% ' + stakingPool.rewardTokens[1].symbol
    : ''

  const toolTipInfo = primaryTooltipInfo + secondaryTooltipInfo

  const items = [
    {
      name: 'APR',
      value: totalApy.toFixed(0) + '%',
      hasTooltip: true,
      toolTipInfo,
    },
    { name: 'TVL', value: formatDollarAmount(totalLockedValue) },
  ]


  return (
    <Container>
      <TopWrapper>
        <StakingAmount />
        <StakingPool pool={stakingPool} />
        <StakingBalance />
        <StakingDetails />
      </TopWrapper>
    </Container>
  )
}
