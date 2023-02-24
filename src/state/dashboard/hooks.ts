import { useAppSelector, AppState } from 'state'

export const useDashboardState = () => {
  return useAppSelector((state: AppState) => state.dashboard)
}

export const useDeusMetrics = () => {
  const { deusCirculatingSupply } = useDashboardState()
  return { deusCirculatingSupply }
}

export const useDeusPrice = (): string => {
  const dashboardState = useDashboardState()
  return dashboardState.deusPrice.toString()
}

export const useDeiPrice = (): string => {
  const dashboardState = useDashboardState()
  return dashboardState.deiPrice.toString()
}

export const useXDeusPrice = (): string => {
  const dashboardState = useDashboardState()
  return dashboardState.xDeusPrice.toString()
}
