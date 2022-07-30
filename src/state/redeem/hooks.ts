import { useMemo } from 'react'
import { useAppSelector, AppState } from 'state'
import { IClaimToken } from './reducer'
import { Tokens } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'

export const useRedeemState = () => {
  return useAppSelector((state: AppState) => state.redeem)
}

export const useClaimableTokens = () => {
  // const { unClaimed } = useRedeemState()
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

    const items = Array<IClaimToken>()

    const usdcToken = Tokens.USDC[SupportedChainId.FANTOM]
    const deusToken = Tokens.DEUS[SupportedChainId.FANTOM]

    items.push({
      symbol: usdcToken.symbol,
      amount: 12414.21,
      decimals: usdcToken.decimals,
      depositedBlock: 0,
      claimableBlock: 10,
      isClaimed: false,
    } as IClaimToken)

    items.push({
      symbol: deusToken.symbol,
      amount: 85.69,
      decimals: deusToken.decimals,
      depositedBlock: 0,
      claimableBlock: 10,
      isClaimed: false,
    } as IClaimToken)

    items.push({
      symbol: deusToken.symbol,
      amount: 815.169,
      decimals: deusToken.decimals,
      depositedBlock: 1659195305,
      claimableBlock: 1659215605,
      isClaimed: false,
    } as IClaimToken)

    return items
  }, [])
}
