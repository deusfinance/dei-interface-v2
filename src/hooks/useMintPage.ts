import { useCallback, useMemo, useState } from 'react'
// import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'bignumber.js'
import debounce from 'lodash/debounce'
import { Token } from '@sushiswap/core-sdk'
import { formatUnits } from '@ethersproject/units'

import { DEI_TOKEN, DEUS_TOKEN, USDC_TOKEN } from 'constants/tokens'
import { BN_ONE, BN_TEN, toBN } from 'utils/numbers'

import { useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useCollateralPrice, useMintCollateralRatio } from 'state/dei/hooks'
import { useMintState } from 'state/mint/reducer'
import { useMintingFee } from 'state/dei/hooks'

import { useDeusPrice } from 'hooks/useCoingeckoPrice'
import { useCollateralPoolContract, useOracleContract } from 'hooks/useContract'

export function useMintPage(
  TokenIn1: Token | null,
  TokenIn2: Token | null,
  TokenOut1: Token | null
): {
  amountIn1: string
  amountIn2: string
  amountOut: string
  onUserInput1: (amount: string) => void
  onUserInput2: (amount: string) => void
  onUserOutput: (amount: string) => void
} {
  const cRatio = useMintCollateralRatio()
  const cPrice = useCollateralPrice()
  const dPrice = useGetDeusPrice()
  const feePercentage = useMintingFee()
  const { isProxyMinter } = useMintState()

  const [amountIn1, setAmountIn1] = useState<string>('')
  const [amountIn2, setAmountIn2] = useState<string>('')
  const [amountOut, setAmountOut] = useState<string>('')

  // useEffect(() => {
  //   let result = false

  //   if (!chainId) {
  //     result = false
  //   } else if (cRatio == 1 && Collateral[chainId] == TokenIn1?.address && !TokenIn2) {
  //     result = false
  //   } else if (cRatio == 0 && TokenIn1?.symbol == 'DEUS' && !TokenIn2) {
  //     result = false
  //   } else if (cRatio > 0 && cRatio < 1 && TokenIn2) {
  //     result = false
  //   } else {
  //     result = true
  //   }

  //   // dispatch(setIsProxyMinter(result))
  // }, [chainId, cRatio, TokenIn1, TokenIn2])

  const [collateralRatio, collateralPrice, deusPrice]: BigNumber[] = useMemo(() => {
    return [toBN(cRatio).div(100), toBN(cPrice).div(1e6), toBN(dPrice)]
  }, [cRatio, cPrice, dPrice])

  const feeFactorBN: BigNumber = useMemo(() => {
    return toBN(1 - feePercentage / 100)
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
        setAmountIn2('')
        setAmountOut('')
        return
      }

      const inputAmount1 = toBN(amount)
      const inputAmount2 = inputAmount1
        .times(inputUnit1)
        .times(BN_ONE.minus(collateralRatio))
        .div(collateralRatio)
        .div(inputUnit2)
      const outputAmount = inputAmount1.times(inputUnit1).plus(inputAmount2.times(inputUnit2)).times(feeFactorBN)
      setAmountIn2(inputAmount2.toString())
      setAmountOut(outputAmount.toString())
    }, 500),
    [isProxyMinter, TokenOut1, inputUnit1, inputUnit2, feeFactorBN]
  )

  const debounceUserInput2 = useCallback(
    debounce((amount: string) => {
      if (amount === '') {
        setAmountIn1('')
        setAmountOut('')
        return
      }

      const inputAmount2 = toBN(amount)
      const inputAmount1 = inputAmount2
        .times(inputUnit2)
        .times(collateralRatio)
        .div(BN_ONE.minus(collateralRatio))
        .div(inputUnit1)
      const outputAmount = inputAmount1.times(inputUnit1).plus(inputAmount2.times(inputUnit2)).times(feeFactorBN)

      setAmountIn1(inputAmount1.toString())
      setAmountOut(outputAmount.toString())
    }, 500),
    [collateralRatio, inputUnit1, inputUnit2, feeFactorBN]
  )

  const debounceUserOutput = useCallback(
    debounce((amount: string) => {
      if (amount === '') {
        setAmountIn1('')
        setAmountIn2('')
        return
      }

      // if (isProxyMinter) {
      //   console.log('Unable to type outputs with this proxy pair.')
      //   return
      // }

      //toBN(2).minus(feeFactorBN) = 1.005
      const outputAmount = toBN(amount)
      const inputAmount1 = outputAmount.times(toBN(2).minus(feeFactorBN)).times(collateralRatio).div(inputUnit1)
      const inputAmount2 = outputAmount.div(feeFactorBN).times(BN_ONE.minus(collateralRatio)).div(inputUnit2)
      setAmountIn1(inputAmount1.toString())
      setAmountIn2(inputAmount2.toString())
    }, 500),
    [isProxyMinter, collateralRatio, inputUnit1, inputUnit2, feeFactorBN]
  )

  const onUserInput1 = (amount: string): void => {
    setAmountIn1(amount)
    debounceUserInput1(amount)
  }

  const onUserInput2 = (amount: string): void => {
    setAmountIn2(amount)
    // updateProxyValues(null)
    debounceUserInput2(amount)
  }

  const onUserOutput = (amount: string): void => {
    setAmountOut(amount)
    // updateProxyValues(null)
    debounceUserOutput(amount)
  }

  return {
    amountIn1,
    amountIn2,
    amountOut,
    onUserInput1,
    onUserInput2,
    onUserOutput,
  }
}

export function useMintAmountOut(
  amountIn: string,
  deusPrice: string
): {
  collatAmount: string
  deusAmount: string
} {
  const amountInBN = amountIn ? toBN(amountIn).times(BN_TEN.pow(DEI_TOKEN.decimals)).toFixed(0) : ''
  const contract = useCollateralPoolContract()

  const amountOutCall = useMemo(
    () =>
      !amountInBN || amountInBN == '' || amountInBN == '0' || deusPrice === '0' || !deusPrice
        ? []
        : [
            {
              methodName: 'collatAndDeusAmountForMinting',
              callInputs: [amountInBN, deusPrice],
            },
          ],
    [amountInBN, deusPrice]
  )
  // console.log({ amountOutCall })
  const [mintAmountIns] = useSingleContractMultipleMethods(contract, amountOutCall)

  const collatAmount =
    !mintAmountIns || !mintAmountIns.result
      ? ''
      : toBN(formatUnits(mintAmountIns.result[0].toString(), USDC_TOKEN.decimals)).toString()
  const deusAmount =
    !mintAmountIns || !mintAmountIns.result
      ? ''
      : toBN(formatUnits(mintAmountIns.result[1].toString(), DEUS_TOKEN.decimals)).toString()

  return {
    collatAmount,
    deusAmount,
  }
}

export function useGetOracleAddress(): string {
  const contract = useCollateralPoolContract()

  const call = useMemo(
    () => [
      {
        methodName: 'oracle',
        callInputs: [],
      },
    ],
    []
  )

  const [oracleAddressRes] = useSingleContractMultipleMethods(contract, call)

  return !oracleAddressRes || !oracleAddressRes.result ? '' : oracleAddressRes.result[0].toString()
}

export function useGetDeusPrice(): string {
  const address = useGetOracleAddress()
  const contract = useOracleContract(address)
  const coinGeckoDeusPrice = useDeusPrice()

  const call = useMemo(
    () => [
      {
        methodName: 'getPrice',
        callInputs: [],
      },
    ],
    []
  )
  const [deusPriceRes] = useSingleContractMultipleMethods(contract, call)

  const deusPrice =
    !deusPriceRes || !deusPriceRes.result
      ? coinGeckoDeusPrice
        ? toBN(coinGeckoDeusPrice).times(BN_TEN.pow(DEUS_TOKEN.decimals)).toFixed(0)
        : ''
      : toBN(deusPriceRes.result[0].toString())
          .times(BN_TEN.pow(DEUS_TOKEN.decimals - 6))
          .toFixed(0)

  return deusPrice
}
