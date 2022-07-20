import { isAddress } from './validate'

export function truncateAddress(address: string, chars = 4) {
  const parsed = isAddress(address)
  if (!parsed) {
    console.error(`Invalid 'address' parameter '${address}'.`)
    return null
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}
