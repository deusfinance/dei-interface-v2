import { useMemo, useCallback } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'

import { ORACLE_BASE_URL } from 'constants/muon'
import { makeHttpRequest } from 'utils/http'
import useWeb3React from 'hooks/useWeb3'
import { useCollateralPoolContract } from './useContract'
import { useRedeemCollateralRatio } from 'state/dei/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'

import { calculateGasMargin, toWei } from 'utils/web3'
import { dynamicPrecision } from 'utils/numbers'
import { Token } from '@sushiswap/core-sdk'

export enum RedeemCallbackState {
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  VALID = 'VALID',
}

interface OracleResponse {
  collateral_price: number
  deus_price: number
  expire_block: number
  signature: string
}

export default function useRedeemCallback(
  TokenIn: Token | null,
  TokenOut1: Token | null,
  TokenOut2: Token | null,
  amountIn: string
): {
  state: RedeemCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { chainId, account, library } = useWeb3React()
  const CollateralPoolContract = useCollateralPoolContract()
  const addTransaction = useTransactionAdder()
  const collateralRatio = useRedeemCollateralRatio()

  const amountInBN = useMemo(() => {
    return toWei(amountIn, TokenIn?.decimals ?? 18, true)
  }, [amountIn, TokenIn])

  const oracleRequest = useCallback(
    async (query) => {
      try {
        if (!chainId) throw new Error('No chainId present')
        const { href: url } = new URL(`/dei/${query}?chainId=${chainId}`, ORACLE_BASE_URL)
        return makeHttpRequest(url)
      } catch (err) {
        throw err
      }
    },
    [chainId]
  )

  //TODO: [signature] or signature
  const getParamsRedeem = useCallback(async () => {
    try {
      if (collateralRatio == 1) {
        const query = 'redeem-1to1'
        const { collateral_price, expire_block, signature }: OracleResponse = await oracleRequest(query)
        return ['redeem1t1DEI', [amountInBN, collateral_price, expire_block, [signature]]]
      }
      if (collateralRatio > 0) {
        const query = 'mint-fractional'
        const { collateral_price, deus_price, expire_block, signature }: OracleResponse = await oracleRequest(query)
        return ['redeemFractionalDEI', [amountInBN, collateral_price, deus_price, expire_block, [signature]]]
      }
      const query = 'mint-algorithmic'
      const { deus_price, expire_block, signature }: OracleResponse = await oracleRequest(query)
      return ['redeemAlgorithmicDEI', [amountInBN, deus_price, expire_block, [signature]]]
    } catch (err) {
      console.error(err)
      return null
    }
  }, [oracleRequest, collateralRatio, amountInBN])

  const constructCall = useCallback(async () => {
    const Contract = CollateralPoolContract
    try {
      if (!chainId || !account || !TokenIn || !Contract) {
        throw new Error('Missing dependencies.')
      }
      const args: any = await getParamsRedeem()
      const methodName = args[0]
      const params = args[1]

      return {
        address: Contract.address,
        calldata: Contract.interface.encodeFunctionData(methodName, params) ?? '',
        staticResult: await Contract.callStatic[methodName](...params),
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, chainId, TokenIn, CollateralPoolContract, getParamsRedeem])

  return useMemo(() => {
    if (!account || !chainId || !library || !CollateralPoolContract || !TokenIn || !TokenOut1 || !TokenOut2) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    if (!amountIn || amountIn == '' || amountIn == '0') {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }
    return {
      state: RedeemCallbackState.VALID,
      error: null,
      callback: async function onRedeem(): Promise<string> {
        console.log('onRedeem callback')
        const call = await constructCall()
        const { address, calldata, staticResult: exactDeiOut } = call

        const tx = { from: account, to: address, data: calldata }
        console.log('Redeem TRANSACTION', { tx })

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
              return {
                error: new Error(callError), // TODO make this human readable
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for minting DEI.')
        }

        return library
          .getSigner()
          .sendTransaction({
            from: account,
            to: address,
            data: calldata,
            ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
            // gasPrice /// TODO add gasPrice based on EIP 1559
          })
          .then((response: TransactionResponse) => {
            console.log(response)
            console.log({ exactDeiOut })
            const base = `${dynamicPrecision(amountIn)} ${TokenIn.symbol}`
            const summary = `Redeem ${base}`

            addTransaction(response, {
              summary,
            })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`Redeem failed: ${error.message}`) // TODO make this human readable, see: https://github.com/sushiswap/sushiswap-interface/blob/2082b7ded0162324e83aeffad261cc511441f00e/src/hooks/useSwapCallback.ts#L470
            }
          })
      },
    }
  }, [
    amountIn,
    account,
    chainId,
    library,
    constructCall,
    CollateralPoolContract,
    TokenIn,
    TokenOut1,
    TokenOut2,
    addTransaction,
  ])
}

export function useCollectRedemptionCallback(
  Token1: Token | null,
  Token2: Token | null,
  amount1: number,
  amount2: number
): {
  state: RedeemCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { chainId, account, library } = useWeb3React()
  const CollateralPoolContract = useCollateralPoolContract()
  const addTransaction = useTransactionAdder()

  const constructCall = useCallback(async () => {
    const Contract = CollateralPoolContract
    try {
      if (!chainId || !account || !Contract) {
        throw new Error('Missing dependencies.')
      }
      const methodName = 'collectRedemption'

      return {
        address: Contract.address,
        calldata: Contract.interface.encodeFunctionData(methodName) ?? '',
        staticResult: await Contract.callStatic[methodName](),
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [account, chainId, CollateralPoolContract])

  return useMemo(() => {
    if (!account || !chainId || !library || !CollateralPoolContract || !Token1 || !Token2) {
      return {
        state: RedeemCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }

    return {
      state: RedeemCallbackState.VALID,
      error: null,
      callback: async function collectRedemption(): Promise<string> {
        console.log('collectRedemption callback')
        const call = await constructCall()
        const { address, calldata, staticResult: exactDeiOut } = call

        const tx = { from: account, to: address, data: calldata }
        console.log('CollectRedemption TRANSACTION', { tx })

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
              return {
                error: new Error(callError), // TODO make this human readable
              }
            })
        })

        if ('error' in estimatedGas) {
          throw new Error('Unexpected error. Could not estimate gas for minting DEI.')
        }

        return library
          .getSigner()
          .sendTransaction({
            from: account,
            to: address,
            data: calldata,
            ...(estimatedGas ? { gasLimit: calculateGasMargin(estimatedGas) } : {}),
            // gasPrice /// TODO add gasPrice based on EIP 1559
          })
          .then((response: TransactionResponse) => {
            console.log(response)
            console.log({ exactDeiOut })
            const base = `${dynamicPrecision(amount1.toString())} ${Token1.symbol} & ${dynamicPrecision(
              amount2.toString()
            )} ${Token2.symbol}`

            const summary = `Claim ${base}`

            addTransaction(response, {
              summary,
            })

            return response.hash
          })
          .catch((error) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`Redeem failed: ${error.message}`) // TODO make this human readable, see: https://github.com/sushiswap/sushiswap-interface/blob/2082b7ded0162324e83aeffad261cc511441f00e/src/hooks/useSwapCallback.ts#L470
            }
          })
      },
    }
  }, [
    account,
    chainId,
    library,
    constructCall,
    CollateralPoolContract,
    Token1,
    Token2,
    amount1,
    amount2,
    addTransaction,
  ])
}
