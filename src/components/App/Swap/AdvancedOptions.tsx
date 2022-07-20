import React from 'react'
import SlippageTolerance from './SlippageTolerance'

export default function AdvancedOptions({
  slippage,
  setSlippage,
}: {
  slippage: number
  setSlippage: (value: number) => void
}) {
  return (
    <SlippageTolerance
      slippage={slippage}
      setSlippage={setSlippage}
      style={{ marginTop: '0px' }}
      bgColor={'grad_dei'}
    />
  )
}
