// import StaticImageData from 'next/image'
import { isAddress } from './address'
import { SupportedChainId, SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { AddressMap, DecimalMap } from 'utils/address'

export interface IToken {
  chainId: number
  address: string
  decimals: number
  symbol: string
  name: string
  isNative: boolean
  isToken: boolean
}

export type TokenMap = {
  [key: number]: IToken
}

export function duplicateTokenByChainId(
  address: string,
  decimals: number,
  name: string,
  symbol: string,
  chains: SupportedChainId[] = SUPPORTED_CHAIN_IDS
): TokenMap {
  return chains.reduce((acc: TokenMap, chainId: number) => {
    acc[chainId] = new Token(chainId, address, decimals, name, symbol)
    return acc
  }, {})
}

//generate same tokens by given AddressMap
export function duplicateTokenByAddressMap(
  addressMap: AddressMap,
  decimals: number,
  name: string,
  symbol: string,
  decimalMap: DecimalMap = {}
): TokenMap {
  return Object.keys(addressMap)
    .map((chainId) => Number(chainId)) //convert string to number because of the object.keys() always returns string
    .reduce((acc: TokenMap, chainId: number) => {
      acc[chainId] = new Token(chainId, addressMap[chainId], decimalMap[chainId] ?? decimals, name, symbol)
      return acc
    }, {})
}

export class Token implements IToken {
  chainId: number
  address: string
  decimals: number
  symbol: string
  name: string
  isNative: boolean
  isToken: boolean

  constructor(chainId: number, address: string, decimals: number, symbol: string, name: string) {
    this.chainId = chainId
    this.address = address
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
    this.isNative = this.getIsNative()
    this.isToken = this.getIsToken()
  }

  private getIsNative(): boolean {
    return this.address === '0x'
  }

  private getIsToken(): boolean {
    return isAddress(this.address) ? true : false
  }
}
