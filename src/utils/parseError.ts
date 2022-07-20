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
export function MintErrorToUserReadableMessage(error: any): string {
  let reason: string | undefined

  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }

  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)
  return `Unknown error${reason ? `: "${reason}"` : ''}. Try increasing your slippage tolerance.`
}
