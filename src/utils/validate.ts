import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'

export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function isZero(hexNumberString: string): boolean {
  return /^0x0*$/.test(hexNumberString)
}

export function isEmptyValue(text: string): boolean {
  return BigNumber.isBigNumber(text)
    ? BigNumber.from(text).isZero()
    : text === '' || text.replace(/0/g, '').replace(/\./, '') === ''
}
