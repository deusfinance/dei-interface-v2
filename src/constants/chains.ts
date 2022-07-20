// We allow the user to connect with these chains, so we can force them to change to Fantom.
// E.g. if the user's chain is not in the list, web3react will deny connection and then we can't change to Fantom.
export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  TELOS = 40,
  XDAI = 100,
  FUSE = 122,
  CELO = 42220,

  BSC = 56,
  BSC_TESTNET = 97,

  OKEX_TESTNET = 65,
  OKEX = 66,

  HECO = 128,
  HECO_TESTNET = 256,

  POLYGON = 137,
  POLYGON_TESTNET = 80001,

  FANTOM = 250,
  FANTOM_TESTNET = 4002,

  MOONRIVER = 1285,
  MOONBEAM_TESTNET = 1287,

  ARBITRUM = 42161,
  ARBITRUM_TESTNET = 79377087078960,

  AVALANCHE_TESTNET = 43113,
  AVALANCHE = 43114,

  HARMONY = 1666600000,
  HARMONY_TESTNET = 1666700000,

  PALM = 11297108109,
  PALM_TESTNET = 11297108099,
}

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[]

export const SolidlyChains = [SupportedChainId.FANTOM]

export const FALLBACK_CHAIN_ID = SupportedChainId.FANTOM

export const NETWORK_URLS: { [chainId: number]: string } = {
  [SupportedChainId.FANTOM]: 'https://rpc.ftm.tools',
}
