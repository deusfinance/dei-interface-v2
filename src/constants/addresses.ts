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
    SupportedChainId.ARBITRUM,
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
                USDC RESERVE ADDRESS
===================================== */
export const USDCReserves1: AddressMap = {
  [SupportedChainId.FANTOM]: '0x0092fc463b969347f2F6d18a572BDf99F61B5e8F',
}

/* =====================================
                DAPP CONTRACTS ADDRESS
===================================== */

export const Multicall2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x22D4cF72C45F8198CfbF4B568dBdB5A85e8DC0B5',
  [SupportedChainId.ARBITRUM]: '0x7F55Ad3F5659aC8Eb07E545ab04a9Ca5863f7E12',
}

export const veDist: AddressMap = {
  [SupportedChainId.FANTOM]: '0x09cE8C8E2704E84750E9c1a4F54A30eF60aF0073',
}

export const DeiBonder: AddressMap = {
  [SupportedChainId.FANTOM]: '0x958C24d5cDF94fAF47cF4d66400Af598Dedc6e62',
}

export const CollateralPool: AddressMap = {
  [SupportedChainId.FANTOM]: '0x6E0098A8c651F7A6A9510B270CD02c858C344D94',
  [SupportedChainId.ARBITRUM]: '0x24c99A5f82DB4d4B3Ed30A09ccc4A57F451Ea7Bd',
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

export const MultiSigReservesPool: AddressMap = {
  [SupportedChainId.MAINNET]: '0x5B598261c2A8a9B2fb564Ff26BE93B79A87e554D',
}
/* =====================================
                LQDR Tokens ADDRESS
===================================== */
export const CLQDR_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x814c66594a22404e101fecfecac1012d8d75c156',
}

export const LQDR_ADDRESS: AddressMap = {
  [SupportedChainId.FANTOM]: '0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9',
}
