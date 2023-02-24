import { useEffect } from 'react'
import { AppThunkDispatch, useAppDispatch } from 'state'
import { autoRefresh } from 'utils/retry'
import { fetchDeiPrice, fetchDeusPrice, fetchXDeusPrice } from './reducer'

export default function Updater(): null {
  const thunkDispatch: AppThunkDispatch = useAppDispatch()

  useEffect(() => {
    return autoRefresh(() => thunkDispatch(fetchDeusPrice()), 300)
  }, [thunkDispatch])

  useEffect(() => {
    return autoRefresh(() => thunkDispatch(fetchDeiPrice()), 300)
  }, [thunkDispatch])

  useEffect(() => {
    return autoRefresh(() => thunkDispatch(fetchXDeusPrice()), 300)
  }, [thunkDispatch])

  return null
}
