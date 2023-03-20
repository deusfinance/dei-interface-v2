import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useMemo } from 'react'
import { truncateAddress } from 'utils/address'
import { SupportedChainId } from 'constants/chains'
import { CollateralPool } from 'constants/addresses'

import { useDeusPrice } from 'state/dashboard/hooks'

import { useDeiStats } from 'hooks/useDeiStats'

export default function usePoolStats(): { name: string; value: number | string; link?: string }[] {
  const { collateralRatio } = useDeiStats()
  const deusPrice = useDeusPrice()

  const usdcBackingPerDei = useMemo(() => {
    if (collateralRatio > 100) return '100%'
    else if (collateralRatio < 90) return '90%'
    return `${formatAmount(collateralRatio, 1).toString()}%`
  }, [collateralRatio])

  return useMemo(
    () => [
      { name: 'DEI Price', value: '$1.00' },
      { name: 'Collateral Ratio', value: usdcBackingPerDei ?? '-' },
      { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusPrice), 2) ?? '-' },
      {
        name: 'Pool(V3)',
        value: truncateAddress(CollateralPool[SupportedChainId.FANTOM]) ?? '-',
        link: CollateralPool[SupportedChainId.FANTOM],
      },
    ],
    [usdcBackingPerDei, deusPrice]
  )
}
