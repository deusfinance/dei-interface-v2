import { useMemo } from 'react'
import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useFujinManagerContract } from 'hooks/useContract'
import useWeb3React from './useWeb3'

export function useLendingImmutables(immutables: string[]): {
  immutablesEncoded: string
} {
  const { account } = useWeb3React()
  const contract = useFujinManagerContract()

  const call = useMemo(
    () =>
      !account || immutables.length !== 3
        ? []
        : [
            {
              methodName: 'getLendingImmutables',
              callInputs: [account, ...immutables],
            },
          ],
    [account, immutables]
  )
  const [res] = useSingleContractMultipleMethods(contract, call)

  const immutablesEncoded = !res || !res.result ? '' : res.result[0].toString()
  console.log({ immutablesEncoded })

  return {
    immutablesEncoded,
  }
}
