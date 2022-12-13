import { toast } from 'react-hot-toast'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import { toBN } from 'utils/numbers'
import { DefaultHandlerError } from 'utils/parseError'

export enum TransactionCallbackState {
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  VALID = 'VALID',
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000))
}

export function toWei<B extends boolean>(
  amount: string | number,
  decimals: number,
  asBigNumber: B
): B extends true ? BigNumber : string

export function toWei(amount: string | number, decimals = 18, asBigNumber: boolean): BigNumber | string {
  const getOutput = (val: string) => {
    return asBigNumber ? BigNumber.from(val) : val
  }
  if (typeof amount != 'string' && typeof amount != 'number') {
    return getOutput('0')
  }
  if (typeof amount === 'string' && isNaN(Number(amount))) {
    return getOutput('0')
  }
  if (!amount || amount == '') {
    return getOutput('0')
  }

  const value = typeof amount == 'number' ? amount.toString() : amount

  const result = toBN(value).times(toBN(10).pow(decimals)).toFixed(0)

  return asBigNumber ? BigNumber.from(result) : result
}

//general callback function for sending transaction to wallet providers
export async function createTransactionCallback(
  methodName: string,
  constructCall: () =>
    | { address: string; calldata: string; value: number; error?: undefined }
    | { address?: undefined; calldata?: undefined; value?: undefined; error: any }
    | Promise<any>,
  addTransaction: any,
  summary: string,
  account: undefined | null | string,
  library: any
) {
  console.log(`on${methodName.charAt(0).toUpperCase() + methodName.slice(1)} Callback`)
  const call = await constructCall()
  const { address, calldata, value } = call
  if ('error' in call) {
    console.error(call.error)
    if (call.error.message) {
      throw new Error(call.error.message)
    } else {
      throw new Error('Unexpected error. Could not construct calldata.')
    }
  }

  const tx = !value
    ? { from: account, to: address, data: calldata }
    : { from: account, to: address, data: calldata, value }

  console.log(methodName.toUpperCase() + ' TRANSACTION', { tx, value })
  const isForceEnabled = false
  let estimatedGas = await library.estimateGas(tx).catch((gasError: any) => {
    console.debug('Gas estimate failed, trying eth_call to extract error', call)

    return library
      .call(tx)
      .then((result: any) => {
        console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
        return {
          error: new Error('Unexpected issue with estimating the gas. Please try again.'),
        }
      })
      .catch((callError: any) => {
        console.debug('Call threw an error', call, callError)
        toast.error(DefaultHandlerError(callError))
        return {
          error: new Error(callError.message),
        }
      })
  })

  if ('error' in estimatedGas) {
    if (isForceEnabled) {
      estimatedGas = BigNumber.from(500_000)
    } else {
      throw new Error('Unexpected error. Could not estimate gas for this transaction.')
    }
  }

  return library
    .getSigner()
    .sendTransaction({
      ...tx,
      ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
      // gasPrice /// TODO add gasPrice based on EIP 1559
    })
    .then((response: TransactionResponse) => {
      console.log(response)
      addTransaction(response, { summary })

      return response.hash
    })
    .catch((error: any) => {
      // if the user rejected the tx, pass this along
      if (error?.code === 4001) {
        throw new Error('Transaction rejected.')
      } else {
        // otherwise, the error was unexpected and we need to convey that
        console.error(`Transaction failed`, error, address, calldata, value)
        throw new Error(`Transaction failed: ${error.message}`)
      }
    })
}
