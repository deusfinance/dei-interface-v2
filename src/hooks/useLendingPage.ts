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

  return {
    immutablesEncoded,
  }
}

export function useUserDeployedLendingsCount(): string {
  const { account } = useWeb3React()
  const contract = useFujinManagerContract()

  const call = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'userDeployedLendingsCount',
              callInputs: [account],
            },
          ],
    [account]
  )
  const [res] = useSingleContractMultipleMethods(contract, call)

  return !res || !res.result ? '' : res.result[0].toString()
}

export function useDeployerLendings(): string {
  const { account } = useWeb3React()
  const contract = useFujinManagerContract()
  const userDeployedLendingsCount = useUserDeployedLendingsCount()

  const call = useMemo(
    () =>
      !account || !userDeployedLendingsCount
        ? []
        : [
            {
              methodName: 'deployerLendings',
              callInputs: [account, Number(userDeployedLendingsCount) - 1],
            },
          ],
    [account, userDeployedLendingsCount]
  )
  const [res] = useSingleContractMultipleMethods(contract, call)

  return !res || !res.result ? '' : res.result[0].toString()
}
