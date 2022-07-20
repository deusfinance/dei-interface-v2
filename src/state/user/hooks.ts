import { useCallback, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { useAppDispatch, useAppSelector } from 'state'

import { updateUserSlippageTolerance, updateUserDarkMode } from './actions'

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  )
  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useSetUserSlippageTolerance(): (slippageTolerance: number | 'auto') => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (userSlippageTolerance: number | 'auto') => {
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance,
        })
      )
    },
    [dispatch]
  )
}

/**
 * Return the user's slippage tolerance
 */
export function useUserSlippageTolerance(): number | 'auto' {
  return useAppSelector((state) => {
    return state.user.userSlippageTolerance
  })
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: number): number {
  const allowedSlippage = useUserSlippageTolerance()
  return useMemo(
    () => (allowedSlippage === 'auto' ? defaultSlippageTolerance : allowedSlippage),
    [allowedSlippage, defaultSlippageTolerance]
  )
}
