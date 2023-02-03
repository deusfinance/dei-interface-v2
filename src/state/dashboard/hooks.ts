import { useAppSelector, AppState } from 'state'

export const useDashboardState = () => {
  return useAppSelector((state: AppState) => state.dashboard)
}

export const useDeusPrice = () => {
  const dashboardState = useDashboardState()
  return dashboardState.deusPrice
}

export const useDeusMetrics = () => {
  const dashboardState = useDashboardState()
  return { deusCirculatingSupply: dashboardState.deusCirculatingSupply }
}

export const useDeiPrice = () => {
  const dashboardState = useDashboardState()
  return dashboardState.deiPrice
}
