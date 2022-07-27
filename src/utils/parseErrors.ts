function getErrorState(error: any): string | undefined {
  let reason: string | undefined
  let message: string | undefined

  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    message = error.data.message ?? message
    error = error.error ?? error.data?.originalError
  }
  reason = message ?? reason
  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)
  return reason
}

export function ParseProxyMinterGetAmountOutError(error: any): string | null {
  const reason = getErrorState(error)

  switch (reason) {
    case 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT':
      return 'Your input amount is very small. Try increasing your input amount.'
    case 'UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT':
      return 'Your input amount is incorrect. please check your token decimals.'
    case 'ds-math-sub-underflow':
      return 'Your input amount is very high. Try decreasing your input amount.'
    default:
      if (reason?.indexOf('undefined is not an object') !== -1) {
        console.error(error, reason)
        return `An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note fee on transfer and rebase tokens are incompatible with Uniswap V3.`
      }
      return `Unknown error${reason ? `: "${reason}"` : ''}.`
  }
}

/* export function ParseRedeemGetAmountsError(error: any): string | null {
  const reason = getErrorState(error)

  switch (reason) {
    case 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT':
      return 'Your input amount is very small. Try increasing your input amount.'
    case 'UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT':
      return 'Your input amount is incorrect. please check your token decimals.'
    case 'ds-math-sub-underflow':
      return 'Your input amount is very high. Try decreasing your input amount.'
    default:
      if (reason?.indexOf('undefined is not an object') !== -1) {
        console.error(error, reason)
        return `An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note fee on transfer and rebase tokens are incompatible with Uniswap V3.`
      }
      return `Unknown error${reason ? `: "${reason}"` : ''}.`
  }
} */

//TODO: get All error and make a readable message here
export function MintErrorToUserReadableMessage(error: any): string {
  let reason: string | undefined

  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }

  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)
  return `Unknown error${reason ? `: "${reason}"` : ''}. Try increasing your slippage tolerance.`

  //TODO: fill it all
  /* switch (reason) {
      case 'UniswapV2Router: EXPIRED':
        return `The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.`
      case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
      case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
        return `This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.`
      case 'TransferHelper: TRANSFER_FROM_FAILED':
        return `The input token cannot be transferred. There may be an issue with the input token.`
      case 'UniswapV2: TRANSFER_FAILED':
        return `The output token cannot be transferred. There may be an issue with the output token.`
      case 'UniswapV2: K':
        return `The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.`
      case 'Too little received':
      case 'Too much requested':
      case 'STF':
        return `This transaction will not succeed due to price movement. Try increasing your slippage tolerance.`
      case 'TF':
        return `The output token cannot be transferred. There may be an issue with the output token.`
      default:
        if (reason?.indexOf('undefined is not an object') !== -1) {
          console.error(error, reason)
          return `An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note fee on transfer and rebase tokens are incompatible with Uniswap V3.`
        }
        return `Unknown error${reason ? `: "${reason}"` : ''}. Try increasing your slippage tolerance.`
    } */
}

export function BridgeErrorToUserReadableMessage(error: any): string | null {
  const reason = error
  switch (reason) {
    default:
      return `${reason ? `${reason}` : ''}`
  }
}
