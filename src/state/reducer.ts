import { combineReducers } from '@reduxjs/toolkit'

import application from './application/reducer'
import multicall from './multicall/reducer'
import transactions from './transactions/reducer'
import dei from './dei/reducer'
import user from './user/reducer'
import dashboard from './dashboard/reducer'
import mint from './mint/reducer'
import navbarOption from './web3navbar/reducer'

const reducer = combineReducers({
  dashboard,
  application,
  dei,
  multicall,
  transactions,
  user,
  mint,
  navbarOption,
})

export default reducer
