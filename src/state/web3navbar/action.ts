import { createAction } from '@reduxjs/toolkit'
import { TNAVBAR_OPTIONS } from './types'

interface IUpdaterProp {
  payload: Partial<TNAVBAR_OPTIONS>
}
export const updateNavbarOption = createAction<IUpdaterProp>('web3NavbarOption')
