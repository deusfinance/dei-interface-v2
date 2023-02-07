import {
  Dashboard as DashboardIcon,
  Mint as MintIcon,
  Redeem as RedeemIcon,
  Staking as StakingIcon,
  Swap as SwapIcon,
} from 'components/Icons'

export const ROUTES = [
  {
    id: 0,
    title: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon,
  },
  {
    id: 1,
    title: 'Mint DEI',
    path: '/mint',
    icon: MintIcon,
  },
  {
    id: 2,
    title: 'Redeem DEI',
    path: '/redemption',
    icon: RedeemIcon,
  },
  {
    id: 3,
    title: 'Pools',
    path: '/stake',
    icon: StakingIcon,
  },
  {
    id: 4,
    title: 'Swap',
    path: '/swap',
    icon: SwapIcon,
  },
]
