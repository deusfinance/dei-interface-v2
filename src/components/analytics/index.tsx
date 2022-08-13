import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { UaEventOptions } from 'react-ga4/types/ga4'
import { isMobile } from 'react-device-detect'
import { useRouter } from 'next/router'
import { getCLS, getFCP, getFID, getLCP, Metric } from 'web-vitals'

import GoogleAnalyticsProvider from './GoogleAnalyticsProvider'

export const GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY = 'ga_client_id'
const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID

let storedClientId: string | null = null
if (typeof window !== 'undefined') {
  storedClientId = window.localStorage.getItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY)
}

const googleAnalytics = new GoogleAnalyticsProvider()

export function sendEvent(event: string | UaEventOptions, params?: any) {
  return googleAnalytics.sendEvent(event, params)
}

export function outboundLink(
  {
    label,
  }: {
    label: string
  },
  hitCallback: () => unknown
) {
  return googleAnalytics.outboundLink({ label }, hitCallback)
}

export function sendTiming(timingCategory: any, timingVar: any, timingValue: any, timingLabel: any) {
  return googleAnalytics.gaCommandSendTiming(timingCategory, timingVar, timingValue, timingLabel)
}

if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  googleAnalytics.initialize(GOOGLE_ANALYTICS_ID, {
    gaOptions: {
      storage: 'none',
      storeGac: false,
      clientId: storedClientId ?? undefined,
    },
  })
  googleAnalytics.set({
    anonymizeIp: true,
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
      ? 'mobileWeb3'
      : 'mobileRegular',
  })
} else {
  googleAnalytics.initialize('test', { gtagOptions: { debug_mode: true } })
}

let installed = false
let hit = false
if (typeof window !== 'undefined') {
  installed = Boolean(window.navigator.serviceWorker?.controller)
  hit = Boolean((window as any).__isDocumentCached)
}
const action = installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'
sendEvent({ category: 'Service Worker', action, nonInteraction: true })

function reportWebVitals({ name, delta, id }: Metric) {
  sendTiming('Web Vitals', name, Math.round(name === 'CLS' ? delta * 1000 : delta), id)
}

// tracks web vitals and pageviews
export function useAnalyticsReporter() {
  const { pathname, query: search } = useRouter()
  useEffect(() => {
    getFCP(reportWebVitals)
    getFID(reportWebVitals)
    getLCP(reportWebVitals)
    getCLS(reportWebVitals)
  }, [])

  const { chainId } = useWeb3React()
  useEffect(() => {
    // cd1 - custom dimension 1 - chainId
    googleAnalytics.set({ cd1: chainId ?? 0 })
  }, [chainId])

  useEffect(() => {
    googleAnalytics.pageview(`${pathname}${search}`)
  }, [pathname, search])

  useEffect(() => {
    // typed as 'any' in react-ga4 -.-
    googleAnalytics.ga((tracker: any) => {
      if (!tracker) return

      const clientId = tracker.get('clientId')
      window.localStorage.setItem(GOOGLE_ANALYTICS_CLIENT_ID_STORAGE_KEY, clientId)
    })
  }, [])
}
