import ApplicationUpdater from './application/updater'
import BorrowUpdater from './borrow/updater'
import MulticallUpdater from './multicall/updater'
import TransactionUpdater from './transactions/updater'
import UserUpdater from './user/updater'
import DashboardUpdater from './dashboard/updater'

export default function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <BorrowUpdater />
      <MulticallUpdater />
      <TransactionUpdater />
      <UserUpdater />
      <DashboardUpdater />
    </>
  )
}
