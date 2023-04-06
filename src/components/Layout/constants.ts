import {
  DeusLogo as DeusIcon,
  Mint as MintIcon,
  Redeem as RedeemIcon,
  Staking as StakingIcon,
  Swap as SwapIcon,
  XDeusLogo as XDeusIcon,
  ClqdrLogo as CLQDRIcon,
  MultichainLogo as MultichainIcon,
  FirebirdLogo as FirebirdIcon,
} from 'components/Icons'

import GET_XDEUS_LOGO from '/public/static/images/pages/dashboard/ic_get_xdeus.svg'
import GET_DEUS_LOGO from '/public/static/images/pages/dashboard/ic_get_deus.svg'
import BRIDGE_LOGO from '/public/static/images/pages/dashboard/ic_bridge.svg'

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
    specialIcon: GET_XDEUS_LOGO,
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
    id: 4,
    title: 'Mint DEI',
    path: '/mint',
    icon: MintIcon,
  },
  {
    id: 5,
    title: 'Redeem DEI',
    path: '/redemption',
    icon: RedeemIcon,
  },
]

export const PARTNERS_MENU_ROUTES = [
  {
    id: 6,
    title: 'Mint cLQDR',
    path: '/clqdr',
    icon: CLQDRIcon,
  },
]

export const USEFUL_LINKS_MENU_ROUTES = [
  {
    id: 7,
    title: 'Firebird',
    path: 'https://app.firebird.finance/swap?outputCurrency=0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44',
    isExternalLink: true,
    icon: FirebirdIcon,
    specialIcon: GET_DEUS_LOGO,
  },
  {
    id: 8,
    title: 'Multichain',
    path: 'https://app.multichain.org/#/router',
    isExternalLink: true,
    icon: MultichainIcon,
    specialIcon: BRIDGE_LOGO,
  },
]
