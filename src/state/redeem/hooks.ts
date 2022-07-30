import { useMemo } from 'react'
import { useAppSelector, AppState } from 'state'
import { IClaimToken } from './reducer'
import { Tokens } from 'constants/tokens'

export const useRedeemState = () => {
  return useAppSelector((state: AppState) => state.redeem)
}

export const useClaimableTokens = () => {
  const { unClaimed } = useRedeemState()
  return useMemo(() => {
    // const items = Array<IClaimToken>()
    // for (let i = 0; i < unClaimed.length; i++) {
    //   const item = unClaimed[i]
    //   if (!token) {
    //     console.log('token is undefined', { token, item })
    //     continue
    //   }
    //   items.push({
    //     symbol: TokenID[item.tokenId],
    //     amount: item.amount,
    //     decimals: token.decimals,
    //     depositedBlock: item.blockNumber,
    //     claimableBlock: item.blockNumber + 10, //TODO
    //     isClaimed: item.isClaimed,
    //   } as IClaimToken)
    // }
    // return items
    return []
  }, [unClaimed])
}
