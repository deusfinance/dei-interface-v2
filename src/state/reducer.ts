import { combineReducers } from '@reduxjs/toolkit'

import application from './application/reducer'
import multicall from './multicall/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import dashboard from './dashboard/reducer'
import mint from './mint/reducer'

const reducer = combineReducers({
  dashboard,
  application,
  multicall,
  transactions,
  user,
  mint,
})

export default reducer
