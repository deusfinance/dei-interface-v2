import { BorrowClient as BorrowMuonClient } from './client/borrow'

// @mali we can pass a custom baseURL here for testing purposes
export const BorrowClient = new BorrowMuonClient()
