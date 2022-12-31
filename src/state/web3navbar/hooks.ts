import { AppState, useAppDispatch, useAppSelector } from 'state'
import { TNAVBAR_OPTIONS } from './types'
import { useEffect } from 'react'
import { updateNavbarOption } from './action'

export function useWeb3NavbarOption(option: Partial<TNAVBAR_OPTIONS>): void {
  const dispatcher = useAppDispatch()
  useEffect(() => {
    dispatcher(updateNavbarOption({ payload: option }))
  }, [dispatcher, option])
}
export function useGetWeb3NavbarOption(): Partial<TNAVBAR_OPTIONS> {
  return useAppSelector((state) => state.navbarOption)
}
