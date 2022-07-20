import { SupportedChainId } from 'constants/chains'

export const MUON_BASE_URL = 'https://node-balancer.muon.net/v1'

export const MUON_NETWORK_NAMES: { [chainId: number]: string } = {
  [SupportedChainId.FANTOM]: 'fantom',
}
