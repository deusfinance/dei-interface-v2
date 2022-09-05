import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { CurrencyAmount, NativeCurrency, Token } from '@sushiswap/core-sdk'
import toast from 'react-hot-toast'

import { useTransactionAdder } from 'state/transactions/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useBridgeContract } from 'hooks/useContract'
import { calculateGasMargin } from 'utils/web3'
import { toHex } from 'utils/hex'
import { CollateralPoolErrorToUserReadableMessage } from 'utils/parseError'
import { BRIDGE__TOKENS } from 'constants/inputs'

export enum DepositCallbackState {
  INVALID = 'INVALID',
  VALID = 'VALID',
}

export default function useDepositCallback(
  inputAmount: CurrencyAmount<NativeCurrency | Token> | null | undefined,
  TokenOut: Token
): {
  state: DepositCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { account, chainId, library } = useWeb3React()
  const addTransaction = useTransactionAdder()

  const { chainId: toChainId, symbol } = TokenOut
  const tokenId = BRIDGE__TOKENS[symbol ?? 'DEI'].tokenId

  const bridgeContract = useBridgeContract()

  const constructCall = useCallback(() => {
    try {
      if (!account || !library || !bridgeContract || !inputAmount || !tokenId || !toChainId) {
        throw new Error('Missing dependencies.')
      }

      const args = [toHex(inputAmount.quotient), toChainId, tokenId]

      return {
        address: bridgeContract.address,
        calldata: bridgeContract.interface.encodeFunctionData('deposit', args) ?? '',
        value: 0,
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, library, bridgeContract, inputAmount, tokenId, toChainId])

  return useMemo(() => {
    if (!account || !chainId || !library || !bridgeContract || !tokenId || !toChainId) {
      return {
        state: DepositCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!inputAmount) {
      return {
        state: DepositCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }

    return {
      state: DepositCallbackState.VALID,
      error: null,
      callback: async function onBridge(): Promise<string> {
        console.log('onBridge callback')
        const call = constructCall()
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

        console.log('BRIDGE TRANSACTION', { tx, value })

        const estimatedGas = await library.estimateGas(tx).catch((gasError) => {
          console.debug('Gas estimate failed, trying eth_call to extract error', call)

          return library
            .call(tx)
            .then((result) => {
              console.debug('Unexpected successful call after failed estimate gas', call, gasError, result)
              return {
                error: new Error('Unexpected issue with estimating the gas. Please try again.'),
              }
            })
            .catch((callError) => {
              console.debug('Call threw an error', call, callError)
              toast.error(CollateralPoolErrorToUserReadableMessage(callError))
              return {
                error: new Error(callError.message),
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for this transaction.')
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
            const summary = `Bridge ${inputAmount?.toSignificant()} ${symbol}`
            addTransaction(response, { summary })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Transaction failed`, error, address, calldata, value)
              throw new Error(`Transaction failed: ${error.message}`)
            }
          })
      },
    }
  }, [
    account,
    chainId,
    library,
    bridgeContract,
    tokenId,
    toChainId,
    inputAmount,
    constructCall,
    symbol,
    addTransaction,
  ])
}
