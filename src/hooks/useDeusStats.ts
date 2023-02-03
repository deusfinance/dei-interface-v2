import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'

import { DEUS_TOKEN } from 'constants/tokens'
import { toBN } from 'utils/numbers'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useERC20Contract } from 'hooks/useContract'

export function useDeusStats(): {
  totalSupply: number
} {
  const deusContract = useERC20Contract(DEUS_TOKEN.address)

  const calls = !deusContract
    ? []
    : [
        {
          methodName: 'totalSupply',
          callInputs: [],
        },
      ]

  const [totalSupplyDEUS] = useSingleContractMultipleMethods(deusContract, calls)

  const { totalSupply } = useMemo(() => {
    return {
      totalSupply: totalSupplyDEUS?.result ? toBN(formatUnits(totalSupplyDEUS.result[0], 18)).toNumber() : 0,
    }
  }, [totalSupplyDEUS])

  return {
    totalSupply,
  }
}
