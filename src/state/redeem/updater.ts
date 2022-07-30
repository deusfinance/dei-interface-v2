import { useEffect } from 'react'
import { useAppDispatch, AppThunkDispatch } from 'state'

import { autoRefresh } from 'utils/retry'
import { fetchUnClaimed } from './reducer'
import useWeb3React from 'hooks/useWeb3'
// import { useClaimableTokens } from './hooks'

export default function Updater(): null {
  const { account } = useWeb3React()
  const thunkDispatch: AppThunkDispatch = useAppDispatch()
  // const unClaimed = useClaimableTokens()

  useEffect(() => {
    if (account) {
      return autoRefresh(() => thunkDispatch(fetchUnClaimed({ address: account })), 20)
    }
  }, [thunkDispatch, account])

  return null
}
