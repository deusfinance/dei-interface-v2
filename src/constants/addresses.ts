import { constructSameAddressMap } from 'utils/address'
import { SupportedChainId } from './chains'

interface AddressMap {
  [chainId: number]: string
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/* =====================================
                USDC ADDRESS
===================================== */
export const USDC_ADDRESS = {
  [SupportedChainId.MAINNET]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [SupportedChainId.RINKEBY]: '0x49AC7cEDdb9464DA9274b164Cd6BA7129Da2C03E',
  [SupportedChainId.POLYGON]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  [SupportedChainId.FANTOM]: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
  [SupportedChainId.BSC]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
}
/* =====================================
                DEI ADDRESS
===================================== */
export const DEI_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
}

export const AnyDEI_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xbB8B2F05A88108F7e9227b954358110c20e97E26', [SupportedChainId.FANTOM]),
}

/* =====================================
                DEUS ADDRESS
===================================== */
export const DEUS_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
}

/* =====================================
                bDEI ADDRESS
===================================== */
export const BDEI_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x05f6ea7F80BDC07f6E0728BbBBAbebEA4E142eE8',
}

/* =====================================
                veDEUS ADDRESS (ERC721)
===================================== */
export const veDEUS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x8b42c6cb07c8dd5fe5db3ac03693867afd11353d',
}

/* =====================================
                PROTOCOL HOLDINGS ADDRESS
===================================== */
export const ProtocolHoldings1: AddressMap = {
  [SupportedChainId.FANTOM]: '0x0b99207afbb08ec101b5691e7d5c6faadd09a89b',
}

export const ProtocolHoldings2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x68c102aba11f5e086c999d99620c78f5bc30ecd8',
}

/* =====================================
                USDC RESERVES ADDRESS
===================================== */
export const USDCReserves1: AddressMap = {
  [SupportedChainId.FANTOM]: '0x083dee8e5ca1e100a9c9ec0744f461b3507e9376',
}

export const USDCReserves2: AddressMap = {
  [SupportedChainId.FANTOM]: '0xfd74e924dc96c72ba52439e28ce780908a630d13',
}

export const USDCReserves3: AddressMap = {
  [SupportedChainId.FANTOM]: '0x37a7a2a5FCB0DF6B8138fec7730825E92f9D8207',
}

/* =====================================
                DAPP CONTRACTS ADDRESS
===================================== */

export const Multicall2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
}

export const BaseV1Factory: AddressMap = {
  [SupportedChainId.FANTOM]: '0x3faab499b519fdc5819e3d7ed0c26111904cbc28',
}

export const BaseV1Voter: AddressMap = {
  [SupportedChainId.FANTOM]: '0xdC819F5d05a6859D2faCbB4A44E5aB105762dbaE',
}

export const BaseV1Minter: AddressMap = {
  [SupportedChainId.FANTOM]: '0xC4209c19b183e72A037b2D1Fb11fbe522054A90D',
}

export const LenderManager: AddressMap = {
  [SupportedChainId.FANTOM]: '0xc02f204bab0248c694516dbaf985d40718ed4f86',
}

export const SolidAddress: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const LegacyDEI_Address: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const Locker: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const SolidexLpDepositor: AddressMap = {
  [SupportedChainId.FANTOM]: '0x26E1A0d851CF28E697870e1b7F053B605C8b060F',
}

export const Reimburse: AddressMap = {
  [SupportedChainId.FANTOM]: '0x85B6996ab768600C14dA1464205bd6b3a864417D',
}

export const veDist: AddressMap = {
  [SupportedChainId.FANTOM]: '0x09cE8C8E2704E84750E9c1a4F54A30eF60aF0073',
}

export const DeiBonder: AddressMap = {
  [SupportedChainId.FANTOM]: '0x958C24d5cDF94fAF47cF4d66400Af598Dedc6e62',
}

export const MintProxy: AddressMap = {
  [SupportedChainId.FANTOM]: '',
}

export const CollateralPool: AddressMap = {
  [SupportedChainId.FANTOM]: '0x6E0098A8c651F7A6A9510B270CD02c858C344D94',
}

export const Collateral: AddressMap = {
  [SupportedChainId.FANTOM]: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
}

export const DeiBondRedeemNFT: AddressMap = {
  [SupportedChainId.FANTOM]: '0x44656b5f0454b3ddbc03471dc391056331f19476',
}

export const DeiBonderV3: AddressMap = {
  [SupportedChainId.FANTOM]: '0x3360d56bcd109216214ef477728A0ED1b7d36A6F',
}

export const TwapOracle: AddressMap = {
  [SupportedChainId.FANTOM]: '0x733570cB9e76fD5293c028e124FC9F0a2234F07c',
}

export const AMO: AddressMap = {
  [SupportedChainId.FANTOM]: '0x521cde355a65144679d15e8aedb5f423778899c9',
}

export const escrow: AddressMap = {
  [SupportedChainId.FANTOM]: '0xFb05aedf0caC43C6ce291D2d1be1eab568D155B4',
}

/* =====================================
                LQDR Tokens ADDRESS
===================================== */
export const CLQDR_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x814c66594a22404e101FEcfECac1012D8d75C156',
}

export const LQDR_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9',
}

export const MasterChefV2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x67932809213AFd6bac5ECD2e4e214Fe18209c419',
}

export const MasterChefV3: AddressMap = {
  [SupportedChainId.FANTOM]: '0x62ad8dE6740314677F06723a7A07797aE5082Dbb',
}

export const StablePool_legacyDEI_bDEI: AddressMap = {
  [SupportedChainId.FANTOM]: '0x9caC3CE5D8327aa5AF54b1b4e99785F991885Bf3',
}

export const StablePool_DEUS_vDEUS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x54a5039C403fff8538fC582e0e3f07387B707381',
}

export const vDeusMasterChefV2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x120FF9821817eA2bbB700e1131e5c856ccC20d1b',
}

export const Migrator: AddressMap = {
  [SupportedChainId.FANTOM]: '0xADC3aaa050852679bed88419CdABde7AB0bfC996',
}

//vDEUS ERC20 Staking (proxy contract)
export const veDEUSMultiRewarderERC20: AddressMap = {
  [SupportedChainId.FANTOM]: '0x9909E6046A9Ca950Cd2a28071338BdcB7d33f9Cb',
}

export const XDEUS_DEUS_SOLIDLY_LP_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x4EF3fF9dadBa30cff48133f5Dc780A28fc48693F',
}

export const SOLID_TOKEN_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0x777172D858dC1599914a1C4c6c9fC48c99a60990',
}
