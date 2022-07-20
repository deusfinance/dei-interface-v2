import { useEffect } from 'react'
import { useAppDispatch } from 'state'

import { setPools } from './reducer'
import { BorrowPools } from 'constants/borrow'

export default function Updater(): null {
  const dispatch = useAppDispatch()

  // This is a weird way to do this with hardcoded pools, I know.
  // Only reason it's here, just in the event of us dynamically adding more pools.
  useEffect(() => {
    dispatch(setPools(BorrowPools))
  }, [dispatch])

  return null
}
