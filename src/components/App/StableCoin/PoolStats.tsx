import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { useMemo } from 'react'
import { truncateAddress } from 'utils/address'
import { SupportedChainId } from 'constants/chains'
import { CollateralPool } from 'constants/addresses'

import { useDeiStats } from 'hooks/useDeiStats'
import { useDeusPrice } from 'hooks/useCoingeckoPrice'

export default function usePoolStats(): { name: string; value: number | string; link?: string }[] {
  const { collateralRatio } = useDeiStats()
  const deusCoingeckoPrice = useDeusPrice()

  return useMemo(
    () => [
      { name: 'DEI Price', value: '$1.00' },
      { name: 'Collateral Ratio', value: formatAmount(collateralRatio, 2) + '%' ?? '-' },
      { name: 'DEUS Price', value: formatDollarAmount(parseFloat(deusCoingeckoPrice), 2) ?? '-' },
      {
        name: 'Pool(V3)',
        value: truncateAddress(CollateralPool[SupportedChainId.FANTOM]) ?? '-',
        link: CollateralPool[SupportedChainId.FANTOM],
      },
    ],
    [collateralRatio, deusCoingeckoPrice]
  )
}
