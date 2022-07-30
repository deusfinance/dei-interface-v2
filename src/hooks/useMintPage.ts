import { useCallback, useMemo, useState, useEffect } from 'react'
// import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'bignumber.js'
import debounce from 'lodash/debounce'
import { Token } from '@sushiswap/core-sdk'
// import { useAppDispatch } from 'state'

import useWeb3React from './useWeb3'
// import useProxiedAmountOutCallback from './useProxiedAmountOutCallback'
import { useCollateralRatio, useCollateralPrice, useDeusPrice } from 'state/dei/hooks'
import { useMintingFee } from 'state/dei/hooks'

import { Collateral } from 'constants/addresses'
import { BN_ONE } from 'utils/numbers'
// import { setIsProxyMinter, setProxyLoading, setProxyValues, useMintState } from 'state/mint/reducer'
import { useMintState } from 'state/mint/reducer'

// TODO calculate price impact here

export function useMintPage(
  TokenIn1: Token | null,
  TokenIn2: Token | null,
  TokenOut1: Token | null
): {
  amount1: string
  amount2: string
  amountOut: string
  onUserInput1: (amount: string) => void
  onUserInput2: (amount: string) => void
  onUserOutput: (amount: string) => void
} {
  // const dispatch = useAppDispatch()
  const { chainId } = useWeb3React()
  const cRatio = useCollateralRatio()
  const cPrice = useCollateralPrice()
  const dPrice = useDeusPrice()
  const feePercentage = useMintingFee()
  const { isProxyMinter } = useMintState()

  const [amount1, setAmount1] = useState<string>('')
  const [amount2, setAmount2] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')

  useEffect(() => {
    let result = false

    if (!chainId) {
      result = false
    } else if (cRatio == 1 && Collateral[chainId] == TokenIn1?.address && !TokenIn2) {
      result = false
    } else if (cRatio == 0 && TokenIn1?.symbol == 'DEUS' && !TokenIn2) {
      result = false
    } else if (cRatio > 0 && cRatio < 1 && TokenIn2) {
      result = false
    } else {
      result = true
    }

    // dispatch(setIsProxyMinter(result))
  }, [chainId, cRatio, TokenIn1, TokenIn2])

  const [collateralRatio, collateralPrice, deusPrice]: BigNumber[] = useMemo(() => {
    return [new BigNumber(cRatio), new BigNumber(cPrice), new BigNumber(dPrice)]
  }, [cRatio, cPrice, dPrice])

  const feeFactorBN: BigNumber = useMemo(() => {
    return new BigNumber(1 - feePercentage / 100)
  }, [feePercentage])

  // const proxiedAmountOutCallback = useProxiedAmountOutCallback(
  //   TokenIn1?.address,
  //   TokenIn1?.decimals,
  //   TokenIn1?.symbol,
  //   collateralPrice,
  //   deusPrice
  // )

  const [inputUnit1, inputUnit2] = useMemo(() => {
    return [collateralRatio.eq(0) ? deusPrice : collateralPrice, deusPrice]
  }, [collateralRatio, collateralPrice, deusPrice])

  // const updateProxyValues = useCallback(
  //   (val: any) => {
  //     if (!val) {
  //       dispatch(setProxyValues([]))
  //     } else {
  //       dispatch(setProxyValues(val.map((v: BigNumber) => v.toString())))
  //     }
  //   },
  //   [dispatch]
  // )

  const debounceUserInput1 = useCallback(
    debounce(async (amount: string) => {
      if (amount === '') {
        setAmount2('')
        setAmountOut('')
        return
      }

      const inputAmount1 = new BigNumber(amount)
      if (!isProxyMinter) {
        const inputAmount2 = inputAmount1
          .times(inputUnit1)
          .times(BN_ONE.minus(collateralRatio))
          .div(collateralRatio)
          .div(inputUnit2)
        const outputAmount = inputAmount1.times(inputUnit1).plus(inputAmount2.times(inputUnit2)).times(feeFactorBN)

        setAmount2(inputAmount2.toString())
        setAmountOut(outputAmount.toString())
      } else {
        // dispatch(setProxyLoading(true))
        // const result = await proxiedAmountOutCallback(inputAmount1)
        // dispatch(setProxyLoading(false))
        // if (!result) {
        //   setAmountOut('')
        //   return
        // }
        // const outputAmount1 = formatUnits(result[0], TokenOut1?.decimals)
        // setAmountOut(outputAmount1)
        // updateProxyValues(result)
      }
    }, 500),
    [isProxyMinter, TokenOut1, inputUnit1, inputUnit2, feeFactorBN]
  )

  const debounceUserInput2 = useCallback(
    debounce((amount: string) => {
      if (amount === '') {
        setAmount1('')
        setAmountOut('')
        return
      }

      const inputAmount2 = new BigNumber(amount)
      const inputAmount1 = inputAmount2
        .times(inputUnit2)
        .times(collateralRatio)
        .div(BN_ONE.minus(collateralRatio))
        .div(inputUnit1)
      const outputAmount = inputAmount1.times(inputUnit1).plus(inputAmount2.times(inputUnit2)).times(feeFactorBN)

      setAmount1(inputAmount1.toString())
      setAmountOut(outputAmount.toString())
    }, 500),
    [collateralRatio, inputUnit1, inputUnit2, feeFactorBN]
  )

  const debounceUserOutput = useCallback(
    debounce((amount: string) => {
      if (amount === '') {
        setAmount1('')
        setAmount2('')
        return
      }

      if (isProxyMinter) {
        console.log('Unable to type outputs with this proxy pair.')
        return
      }

      const outputAmount = new BigNumber(amount)
      const inputAmount1 = outputAmount.div(feeFactorBN).times(collateralRatio).div(inputUnit1)
      const inputAmount2 = outputAmount.div(feeFactorBN).times(BN_ONE.minus(collateralRatio)).div(inputUnit2)

      setAmount1(inputAmount1.toString())
      setAmount2(inputAmount2.toString())
    }, 500),
    [isProxyMinter, collateralRatio, inputUnit1, inputUnit2, feeFactorBN]
  )

  const onUserInput1 = (amount: string): void => {
    setAmount1(amount)
    debounceUserInput1(amount)
  }

  const onUserInput2 = (amount: string): void => {
    setAmount2(amount)
    // updateProxyValues(null)
    debounceUserInput2(amount)
  }

  const onUserOutput = (amount: string): void => {
    setAmountOut(amount)
    // updateProxyValues(null)
    debounceUserOutput(amount)
  }

  return {
    amount1,
    amount2,
    amountOut,
    onUserInput1,
    onUserInput2,
    onUserOutput,
  }
}

export default function useMintAmountOut(
  TokenIn1: Token | null,
  TokenIn2: Token | null,
  amountIn1: string,
  amountIn2: string,
  fee: number
): string {
  return (Number(amountIn1) + Number(amountIn2)).toString()
}
