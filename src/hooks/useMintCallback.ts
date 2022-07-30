import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Token } from '@sushiswap/core-sdk'

import useWeb3React from './useWeb3'
import { useProxyMinterContract, useCollateralPoolContract } from './useContract'

import { useTransactionAdder } from 'state/transactions/hooks'
import { useCollateralRatio } from 'state/dei/hooks'

import { Collateral } from 'constants/addresses'
import { MINT__PATHS } from 'constants/path'
import { ORACLE_BASE_URL } from 'constants/muon'
import { calculateGasMargin, toWei } from 'utils/web3'
import { makeHttpRequest } from 'utils/http'
import { dynamicPrecision, toBN } from 'utils/numbers'

import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { useMintState } from 'state/mint/reducer'
import { MintErrorToUserReadableMessage } from 'utils/parseErrors'

export enum MintCallbackState {
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  VALID = 'VALID',
}

enum CallMethods {
  NATIVE = 'Nativecoin2DEI',
  ERC20 = 'ERC202DEI',
  USDC = 'USDC2DEI',
}

interface OracleResponse {
  collateral_price: number
  deus_price: number
  expire_block: number
  signature: string
}

export default function useMintCallback(
  Token1: Token | null,
  Token2: Token | null,
  TokenOut: Token | null,
  amount1: string,
  amount2: string,
  amountOut: string
): {
  state: MintCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const { chainId, account, library } = useWeb3React()
  const ProxyMinterContract = useProxyMinterContract()
  const CollateralPoolContract = useCollateralPoolContract()
  const addTransaction = useTransactionAdder()
  const collateralRatio = useCollateralRatio()
  const slippagePercentage = useUserSlippageToleranceWithDefault(0.5) // TODO upgrade to gas-dependent calculation
  const { proxyValues, isProxyMinter } = useMintState()

  //   const addressMap = useMemo(() => {
  //     if (!Token1) return ''
  //     return Token2 ? `${Token1.address}:${Token2.address}` : Token1.address
  //   }, [Token1, Token2])

  const minimumAmountOutBN: BigNumber = useMemo(() => {
    if (!TokenOut) return BigNumber.from('0')
    const slippageFactor = toBN(1 - slippagePercentage / 100)
    const slippedAmountOut = toBN(amountOut).times(slippageFactor).toString()
    return toWei(slippedAmountOut, TokenOut.decimals ?? 18, true)
  }, [slippagePercentage, amountOut, TokenOut])

  const [amount1BN, amount2BN, amountOutBN]: BigNumber[] = useMemo(() => {
    return [
      toWei(amount1, Token1?.decimals ?? 18, true),
      toWei(amount2, Token2?.decimals ?? 18, true),
      toWei(amountOut, TokenOut?.decimals ?? 18, true),
    ]
  }, [amount1, amount2, amountOut, Token1, Token2, TokenOut])

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

  const getParamsNoProxy = useCallback(async () => {
    try {
      if (collateralRatio == 1) {
        const query = 'mint-1to1'
        const { collateral_price, expire_block, signature }: OracleResponse = await oracleRequest(query)
        return ['mint1t1DEI', [amount1BN, collateral_price, expire_block, signature]]
      }
      if (collateralRatio > 0) {
        const query = 'mint-fractional'
        const { collateral_price, deus_price, expire_block, signature }: OracleResponse = await oracleRequest(query)
        return ['mintFractional', [amount1BN, amount2BN, collateral_price, deus_price, expire_block, signature]]
      }
      const query = 'mint-algorithmic'
      const { collateral_price, deus_price, expire_block, signature }: OracleResponse = await oracleRequest(query)
      return ['mintAlgorithmic', [amount1BN, amount2BN, collateral_price, deus_price, expire_block, signature]]
    } catch (err) {
      console.error(err)
      return null
    }
  }, [oracleRequest, collateralRatio, amount1BN, amount2BN])

  const getParamsProxy = useCallback(
    async (method) => {
      try {
        if (!proxyValues.length) {
          throw new Error('proxyValues is not an array')
        }

        const query = 'mint-fractional'
        const { collateral_price, deus_price, expire_block, signature }: OracleResponse = await oracleRequest(query)

        const path: string[] | null = chainId && Token1 ? MINT__PATHS[chainId][Token1.symbol ?? 'USDC'] : null

        const params = []
        if (BigNumber.from(proxyValues[0]).eq(amountOutBN)) {
          const tuple = [
            amount1BN,
            minimumAmountOutBN,
            deus_price,
            collateral_price,
            proxyValues[1],
            proxyValues[2],
            expire_block,
            [signature],
          ]
          params.push(tuple)
        }

        if (method === CallMethods.NATIVE || method === CallMethods.ERC20) {
          if (!path) {
            console.error('Unable to find a proxy path for: ', Token1)
            return null
          }
          params.push(path)
        }

        return params
      } catch (err) {
        console.error(err)
        return null
      }
    },
    [oracleRequest, proxyValues, chainId, Token1, amount1BN, amountOutBN, minimumAmountOutBN]
  )

  const constructCall = useCallback(async () => {
    try {
      const Contract = isProxyMinter ? ProxyMinterContract : CollateralPoolContract

      if (!chainId || !account || !Token1 || !Contract) {
        throw new Error('Missing dependencies.')
      }

      const methodName =
        Token1.address == Collateral[chainId]
          ? CallMethods.USDC
          : Token1.isNative
          ? CallMethods.NATIVE
          : CallMethods.ERC20

      const args: any = isProxyMinter ? await getParamsProxy(methodName) : await getParamsNoProxy()

      const value = methodName === CallMethods.NATIVE ? amount1BN : 0

      return {
        address: Contract.address,
        calldata: Contract.interface.encodeFunctionData(methodName, args) ?? '',
        value,
        staticResult: await Contract.callStatic[methodName](...args, { value }),
      }
    } catch (error) {
      return {
        error,
      }
    }
  }, [
    isProxyMinter,
    ProxyMinterContract,
    CollateralPoolContract,
    Token1,
    chainId,
    getParamsProxy,
    getParamsNoProxy,
    account,
    amount1BN,
  ])

  return useMemo(() => {
    if (!account || !chainId || !library || !CollateralPoolContract || !Token1 || !Token2 || !TokenOut) {
      return {
        state: MintCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    // TODO do we really need this? (also see /App/Stablecoin/Mint somewhere)
    // if (pendingMint) {
    //   return {
    //     state: MintCallbackState.PENDING,
    //     callback: null,
    //     error: 'Mint transaction already pending',
    //   }
    // }
    if (!amount1 || amount1 == '0') {
      return {
        state: MintCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    } else if (!amount2 || amount2 == '0') {
      return {
        state: MintCallbackState.INVALID,
        callback: null,
        error: 'No amount provided',
      }
    }
    return {
      state: MintCallbackState.VALID,
      error: null,
      callback: async function onMint(): Promise<string> {
        console.log('onMint callback')
        const call = await constructCall()
        const { address, calldata, value, staticResult: exactDeiOut } = call

        if ('error' in call) {
          throw new Error('Unexpected error. Could not construct calldata.')
        }

        const tx = !value
          ? { from: account, to: address, data: calldata }
          : { from: account, to: address, data: calldata, value }

        console.log('MINT TRANSACTION', { tx, value })

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
                error: new Error(MintErrorToUserReadableMessage(callError)), // TODO make this human readable
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
            const base =
              Token2 && amount2
                ? `${dynamicPrecision(amount1, 0.99)} ${Token1.symbol} + ${dynamicPrecision(amount2, 0.99)} ${
                    Token2.symbol
                  }`
                : `${dynamicPrecision(amount1)} ${Token1.symbol}`
            const summary = `Mint ${dynamicPrecision(formatUnits(exactDeiOut, TokenOut.decimals))} DEI for ${base}`

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
              console.error(`Mint failed`, error, address, calldata, value)
              throw new Error(`Mint failed: ${error.message}`) // TODO make this human readable, see: https://github.com/sushiswap/sushiswap-interface/blob/2082b7ded0162324e83aeffad261cc511441f00e/src/hooks/useSwapCallback.ts#L470
            }
          })
      },
    }
  }, [
    account,
    chainId,
    library,
    CollateralPoolContract,
    amount1,
    amount2,
    constructCall,
    Token1,
    Token2,
    TokenOut,
    addTransaction,
  ])
}
