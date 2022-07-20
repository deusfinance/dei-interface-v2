// we need to create this file for dealing with currencies
// study the patterns used in:
// https://github.com/dsynths/dsynths-app-v2/blob/main/src/hooks/useCurrency.ts#L10
// which points to:
// https://github.com/dsynths/dsynths-app-v2/blob/main/src/hooks/useAssetList.ts

import { useMemo } from 'react'

export function useTokensFromMap(): { [x: string]: any } {
  return useMemo(() => ({}), [])
}
