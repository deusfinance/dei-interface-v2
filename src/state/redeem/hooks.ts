import { useMemo } from 'react'
import { useAppSelector, AppState } from 'state'
import { RedeemState, RedeemBalances } from './reducer'

export function useRedeemState(): RedeemState {
  return useAppSelector((state: AppState) => state.redeem)
}

export function useRedeemBalances(): RedeemBalances {
  const { redeemBalances } = useRedeemState()
  return useMemo(() => redeemBalances, [redeemBalances])
}

export function useShowClaim(): boolean {
  const { showClaim } = useRedeemState()
  return useMemo(() => showClaim, [showClaim])
}
