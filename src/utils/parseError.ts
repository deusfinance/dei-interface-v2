function getErrorState(error: any): string | undefined {
  let reason: string | undefined
  let message: string | undefined

  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    message = error.data?.message ?? message
    error = error.error ?? error.data?.originalError
  }
  reason = message ?? reason
  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)
  return reason
}

export function DefaultHandlerError(error: any): string | null {
  const reason = getErrorState(error)
  return `${reason ? `"${reason}"` : ''}.`
}

//TODO: get All error and make a readable message here
export function CollateralPoolErrorToUserReadableMessage(error: any): string {
  const reason = getErrorState(error)

  switch (reason) {
    case 'TwapUniOracle: NOT_UPDATED':
      return `please "Update Oracle".`

    case 'DEIPool: COLLATERAL_COLLECTION_DELAY':
      return `wait a few seconds and try again`

    case 'DEIV2Pool: DEUS_COLLECTION_DELAY':
      return `wait a few seconds and try again`
  }

  return `${reason ? `"${reason}"` : ''}.`
}
