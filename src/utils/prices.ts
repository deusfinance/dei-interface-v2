import { Percent, JSBI } from '@sushiswap/core-sdk'

export const PERCENT_DENOMINATOR = 100
export const PERCENT_SCALE = 10000
export const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(PERCENT_SCALE), JSBI.BigInt(PERCENT_SCALE))

export function constructPercentage(value: number) {
  const percent = ~~(value * PERCENT_SCALE) // bitwise remove decimals
  return new Percent(JSBI.BigInt(percent), PERCENT_DENOMINATOR * PERCENT_SCALE).multiply(PERCENT_DENOMINATOR)
}
