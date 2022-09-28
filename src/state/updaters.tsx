import ApplicationUpdater from './application/updater'
import MulticallUpdater from './multicall/updater'
import TransactionUpdater from './transactions/updater'
import UserUpdater from './user/updater'
import DeiUpdater from './dei/updater'
import DashboardUpdater from './dashboard/updater'

export default function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <MulticallUpdater />
      <TransactionUpdater />
      <UserUpdater />
      <DeiUpdater />
      <DashboardUpdater />
    </>
  )
}
