import { Token } from '@sushiswap/core-sdk'

import { LenderVersion, UnserializedBorrowPool } from 'state/borrow/reducer'
import { SupportedChainId } from 'constants/chains'
import BASE_V1_MAIN_PAIR from 'constants/abi/BASE_V1_MAIN_PAIR.json'

// TODO SWITCH THIS TOKEN WITH THE BELOW COMMENTED OUT TOKEN FOR PRODUCTION RELEASE
/* export const DEI_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0x4A4573B03B0800e24dEcD8fE497BFeD98ee344B8',
  18,
  'TDEI',
  'TestDEI'
) */

export const DEI_TOKEN = new Token(
  SupportedChainId.FANTOM,
  '0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3',
  18,
  'DEI',
  'DEI'
)

export const BorrowPools: UnserializedBorrowPool[] = [
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xE9e2f34B0BD4f67E82DD96769d00BB6111aE150E',
      18,
      'Solidex vAMM-DEI/DEUS',
      'sex-vAMM-DEI/DEUS'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V2,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'DEI/DEUS',
    oracle: '0x1f45ADBFAF8d1Fb15f0179e9F2C9ec0cCDb481c0',
    generalLender: '0x118FF56bb12E5E0EfC14454B8D7Fa6009487D64E',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    pair0: ['0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0'],
    pair1: ['0xF42dBcf004a93ae6D5922282B304E2aEFDd50058', '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0'],
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xd82001b651f7fb67db99c679133f384244e20e79',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V2,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'USDC/DEI',
    oracle: '0xeC0966eC5f6EA8485cf695316D8df209D59A82f2',
    generalLender: '0x8D643d954798392403eeA19dB8108f595bB8B730',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    pair0: [],
    pair1: ['0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0'],
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
  /*
  //TEST Lender
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0x24e96523c98911589C45CBB9C5DB5E2354B2adCe',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI TEST'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V2,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'USDC/DEI',
    oracle: '0x553F8E3ed0b88c5ceDa9816F0322512d69C3727b',
    generalLender: '0x3e745B226BCF209386601Ba9f859349E06A64eFE',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: '0x729b600dB9472f9B3588e3782C7A9315D42F6E7d',
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  }, */
]

export const DeprecatedBorrowPools: UnserializedBorrowPool[] = [
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xE9e2f34B0BD4f67E82DD96769d00BB6111aE150E',
      18,
      'Solidex vAMM-DEI/DEUS',
      'sex-vAMM-DEI/DEUS'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44', 18, 'DEUS', 'DEUS'),
    version: LenderVersion.V2,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'DEI/DEUS',
    oracle: '0x9f3C610a731809b6F7630B187777c66194EDf27b',
    generalLender: '0x6d9d6A0b927FE954700b29380ae7b1B118f58BF1',
    lpPool: '0xF42dBcf004a93ae6D5922282B304E2aEFDd50058',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xd82001b651f7fb67db99c679133f384244e20e79',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V2,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'USDC/DEI',
    oracle: '0x7D907cF11a3F23d42c5C58426C3b8021F654964C',
    generalLender: '0x1857ca2a664C4E1cD4503f9e0560bC0a9E6f842A',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xd82001b651f7fb67db99c679133f384244e20e79',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V1,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'USDC/DEI',
    oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
    generalLender: '0xeC1Fc57249CEa005fC16b2980470504806fcA20d',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xd82001b651f7fb67db99c679133f384244e20e79',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V1,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'USDC/DEI',
    oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
    generalLender: '0x853CA20E5f059bdbE452e146b91BD6D527f1e0B7',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
  {
    contract: new Token(
      SupportedChainId.FANTOM,
      '0xd82001b651f7fb67db99c679133f384244e20e79',
      18,
      'Solidex sAMM-USDC/DEI',
      'sex-sAMM-USDC/DEI'
    ),
    token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
    token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
    version: LenderVersion.V1,
    abi: BASE_V1_MAIN_PAIR,
    composition: 'USDC/DEI',
    oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
    generalLender: '0x1711dD39aC7540E9aa9F7c405c212466534c25f0',
    lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
    mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
    type: 'Solidex LP Token',
    liquidationFee: 5, // 5%
  },
]

export const ReimbursePool: UnserializedBorrowPool = {
  contract: new Token(
    SupportedChainId.FANTOM,
    '0xd82001b651f7fb67db99c679133f384244e20e79',
    18,
    'Solidex sAMM-USDC/DEI',
    'sex-sAMM-USDC/DEI'
  ),
  token0: new Token(SupportedChainId.FANTOM, '0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3', 18, 'DEI', 'DEI'),
  token1: new Token(SupportedChainId.FANTOM, '0x04068da6c83afcfa0e13ba15a6696662335d5b75', 6, 'USDC', 'USDC'),
  version: LenderVersion.V1,
  abi: BASE_V1_MAIN_PAIR,
  composition: 'USDC/DEI',
  oracle: '0x8878Eb7F44f969D0ed72c6010932791397628546',
  generalLender: '0x85B6996ab768600C14dA1464205bd6b3a864417D',
  lpPool: '0x5821573d8F04947952e76d94f3ABC6d7b43bF8d0',
  mintHelper: '0x1B7879F4dB7980E464d6B92FDbf9DaA8F1E55073',
  type: 'Solidex LP Token',
  liquidationFee: 5, // 5%
}
