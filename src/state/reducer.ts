import { combineReducers } from '@reduxjs/toolkit'

import application from './application/reducer'
import borrow from './borrow/reducer'
import multicall from './multicall/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
import dashboard from './dashboard/reducer'

const reducer = combineReducers({
  borrow,
  dashboard,
  application,
  multicall,
  transactions,
  user,
})

export default reducer
