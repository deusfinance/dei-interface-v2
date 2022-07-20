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
  ...constructSameAddressMap('0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3', [
    SupportedChainId.MAINNET,
    SupportedChainId.POLYGON,
    SupportedChainId.FANTOM,
  ]),
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
                vDEUS ADDRESS (ERC721)
===================================== */
export const vDeus: AddressMap = {
  [SupportedChainId.FANTOM]: '0x980c39133a1a4e83e41d652619adf8aa18b95c8b',
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

export const Locker: AddressMap = {
  [SupportedChainId.FANTOM]: '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
}

export const SolidexLpDepositor: AddressMap = {
  [SupportedChainId.FANTOM]: '0x26E1A0d851CF28E697870e1b7F053B605C8b060F',
}

export const Reimburse: AddressMap = {
  [SupportedChainId.FANTOM]: '0x85B6996ab768600C14dA1464205bd6b3a864417D',
}

export const DynamicRedeemer: AddressMap = {
  [SupportedChainId.FANTOM]: '0xFD74E924dc96c72Ba52439e28CE780908A630D13',
}

export const veDist: AddressMap = {
  [SupportedChainId.FANTOM]: '0x09cE8C8E2704E84750E9c1a4F54A30eF60aF0073',
}

export const DeiBonder: AddressMap = {
  [SupportedChainId.FANTOM]: '0x958C24d5cDF94fAF47cF4d66400Af598Dedc6e62',
}

export const SwapFlashLoan: AddressMap = {
  [SupportedChainId.FANTOM]: '0x9caC3CE5D8327aa5AF54b1b4e99785F991885Bf3',
}

export const MasterChefV2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x67932809213AFd6bac5ECD2e4e214Fe18209c419',
}

export const vDeusMasterChefV2: AddressMap = {
  [SupportedChainId.FANTOM]: '0x120FF9821817eA2bbB700e1131e5c856ccC20d1b',
}

export const vDeusStaking: AddressMap = {
  [SupportedChainId.FANTOM]: '0x978b5d59DeE843C99B205A81ca82F66F35B1Ba35',
}
