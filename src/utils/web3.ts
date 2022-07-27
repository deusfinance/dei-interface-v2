import { BigNumber } from '@ethersproject/bignumber'
import { toBN } from './numbers'

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000))
}

export function toWei<B extends boolean>(
  amount: string | number,
  decimals: number,
  asBigNumber: B
): B extends true ? BigNumber : string

export function toWei(amount: string | number, decimals = 18, asBigNumber: boolean): BigNumber | string {
  const getOutput = (val: string) => {
    return asBigNumber ? BigNumber.from(val) : val
  }
  if (typeof amount != 'string' && typeof amount != 'number') {
    return getOutput('0')
  }
  if (typeof amount === 'string' && isNaN(Number(amount))) {
    return getOutput('0')
  }
  if (!amount || amount == '') {
    return getOutput('0')
  }

  const value = typeof amount == 'number' ? amount.toString() : amount

  const result = toBN(value).times(toBN(10).pow(decimals)).toFixed(0)

  return asBigNumber ? BigNumber.from(result) : result
}
