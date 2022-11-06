import { useMemo } from 'react'
// import { formatUnits } from '@ethersproject/units'

import { DEUS_TOKEN } from 'constants/tokens'
import { BN_TEN, toBN } from 'utils/numbers'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'

import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useOracleContract } from 'hooks/useContract'
import { useGetOracleAddress } from './useMintPage'

export function useGetDeusPrice(): string {
  const address = useGetOracleAddress()
  const contract = useOracleContract(address)
  const coinGeckoDeusPrice = useDeusPrice()

  const call = useMemo(
    () => [
      {
        methodName: 'getPrice',
        callInputs: [],
      },
    ],
    []
  )
  const [deusPriceRes] = useSingleContractMultipleMethods(contract, call)

  const deusPrice =
    !deusPriceRes || !deusPriceRes.result
      ? coinGeckoDeusPrice
        ? toBN(coinGeckoDeusPrice).times(BN_TEN.pow(DEUS_TOKEN.decimals)).toFixed(0)
        : ''
      : toBN(deusPriceRes.result[0].toString())
          .times(BN_TEN.pow(DEUS_TOKEN.decimals - 6))
          .toFixed(0)

  return deusPrice
}
