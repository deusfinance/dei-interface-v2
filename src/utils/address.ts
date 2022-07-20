import { getAddress } from '@ethersproject/address'

export interface AddressMap {
  [chainId: number]: string
}
export interface DecimalMap {
  [chainId: number]: number
}

export function isAddress(value: string) {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function truncateAddress(address: string, size = 4) {
  const parsed = isAddress(address)
  if (!parsed) {
    console.error(`Invalid 'address' parameter '${address}'.`)
    return null
  }
  return `${parsed.substring(0, size + 2)}...${parsed.substring(address.length - size)}`
}

export function constructSameAddressMap(address: string, chainMapping: number[]): AddressMap {
  return chainMapping.reduce((acc: AddressMap, chainId: number) => {
    acc[chainId] = address
    return acc
  }, {})
}
