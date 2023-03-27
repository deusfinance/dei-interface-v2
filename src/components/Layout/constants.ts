import {
  DeusLogo as DeusIcon,
  Mint as MintIcon,
  Redeem as RedeemIcon,
  Staking as StakingIcon,
  Swap as SwapIcon,
  XDeusLogo as XDeusIcon,
} from 'components/Icons'

export const ROUTES = [
  {
    id: 0,
    title: 'Dashboard',
    path: '/dashboard',
    icon: DeusIcon,
  },
  {
    id: 1,
    title: 'xDEUS',
    path: '/xdeus',
    icon: XDeusIcon,
  },
  {
    id: 2,
    title: 'Pools',
    path: '/stake',
    icon: StakingIcon,
  },
  {
    id: 3,
    title: 'Swap',
    path: '/swap',
    icon: SwapIcon,
  },
]

export const DEI_MENU_ROUTES = [
  {
    id: 0,
    title: 'Mint DEI',
    path: '/mint',
    icon: MintIcon,
  },
  {
    id: 1,
    title: 'Redeem DEI',
    path: '/redemption',
    icon: RedeemIcon,
  },
]

export const PARTNERS_MENU_ROUTES = [
  {
    id: 0,
    title: 'Mint cLQDR',
    path: '/clqdr',
    icon: MintIcon,
  },
]

export const USEFUL_LINKS_MENU_ROUTES = [
  {
    id: 0,
    title: 'Firebird',
    path: '',
    icon: MintIcon,
  },
  {
    id: 1,
    title: 'Multichain',
    path: '',
    icon: MintIcon,
  },
]
