import { useMemo, useEffect } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import find from 'lodash/find'

import useWeb3React from 'hooks/useWeb3'
// import useERC20Balance from 'hooks/useERC20Balances'
import useBalanceFormatter from 'hooks/useBalanceFormatter'

import { toWei } from 'utils/web3'

import Dropdown from 'components/Dropdown'
import { HorPartition } from 'components/Partition'
import Input from 'components/Input'
import { Token } from '@sushiswap/core-sdk'

const Wrapper = styled.div<{
  autoHeight: boolean
}>`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  justify-content: flex-start;
  min-width: 230px;
  min-height: ${({ autoHeight }) => (autoHeight ? 'auto' : '100px')};
  background: ${({ theme }) => theme.bg1};
  border-radius: 15px;
  overflow: visible;

  & > * {
    &:not(:first-child) {
      padding: 0.7rem;
    }
    &:first-child {
      margin-bottom: auto;
    }
  }
`

const StyledDropdownOption = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: flex-start;
  gap: 5px;
  align-items: center;
  & > div {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
  }
`

const BalanceLabel = styled.div`
  font-size: 0.75rem;
  text-align: right;
  margin: 5px;
  color: ${({ theme }) => theme.text3};
  &:hover {
    cursor: pointer;
  }
`

const InputWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  background: ${({ theme }) => theme.bg0};
  border-radius: 10px;
  height: 50px;
  padding: 12px;
  white-space: nowrap;
  overflow: hidden;
  border: 2px solid transparent;

  & > * {
    &:last-child {
      margin-left: auto;
    }
  }

  &:hover {
    border: 2px solid ${({ theme }) => theme.secondary2};
  }
`

const MaxButton = styled.div<{
  disabled?: boolean
}>`
  text-align: center;
  background: ${({ theme }) => theme.secondary2};
  font-size: 0.9rem;
  padding: 3px 6px;
  border-radius: 6px;
  transition: transform 0.4s ease;
  &:hover {
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    background: ${({ theme }) => theme.secondary1};
    font-size: 0.9rem;
  }
`

function DropdownOption(tokens: Token[]): JSX.Element {
  return (
    <StyledDropdownOption>
      {tokens.map((token, index) => (
        <div key={index}>
          {index > 0 && <div>+</div>}
          <Image src={token.logo} alt={`${token.name} Logo`} width={25} height={25} />
          {token.symbol}
        </div>
      ))}
    </StyledDropdownOption>
  )
}

const InputOption = ({
  token,
  amount,
  setAmount,
  setInsufficientBalance,
  disabled,
}: {
  token: Token
  amount: string
  setAmount: (amount: string) => void
  setInsufficientBalance: (val: boolean) => void
  disabled?: boolean
}): JSX.Element => {
  const { address, symbol, decimals, isToken } = token
  // const balanceBN = useERC20Balance(address, isToken)
  const balanceBN = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { balanceUser, balanceLabel } = useBalanceFormatter(balanceBN, decimals)

  useEffect(() => {
    if (!amount || amount == '') {
      setInsufficientBalance(false)
    } else {
      setInsufficientBalance(balanceBN.lt(toWei(amount, decimals, true)))
    }
  }, [balanceBN, amount, decimals])

  return (
    <>
      <BalanceLabel onClick={() => !disabled && setAmount(balanceUser)}>
        {balanceLabel} {symbol}
      </BalanceLabel>
      <InputWrapper>
        <Input placeholder="0.00" value={amount} onChange={setAmount} disabled={disabled} />
        <MaxButton onClick={() => !disabled && setAmount(balanceUser)} disabled={disabled}>
          MAX
        </MaxButton>
      </InputWrapper>
    </>
  )
}

export default function InputBox({
  options = [],
  selected = [],
  setSelected = () => null,
  amount1 = '',
  amount2 = '',
  setAmount1 = () => null,
  setAmount2 = () => null,
  setInsufficientBalance1 = () => null,
  setInsufficientBalance2 = () => null,
  disabled = false,
}: {
  options: Array<Token[]>
  selected: string[]
  setSelected?: (addresses: string[]) => void
  amount1: string
  amount2?: string
  setAmount1: (amount: string) => void
  setAmount2?: (amount: string) => void
  setInsufficientBalance1?: (val: boolean) => void
  setInsufficientBalance2?: (val: boolean) => void
  disabled: boolean
}) {
  const { chainId, account } = useWeb3React()

  // Map option values as addresses for the dropdown
  const dropdownOptions = useMemo(() => {
    return options.map((tokens: Token[]) => {
      return {
        value: tokens.map((token) => token.address).join(':'),
        label: DropdownOption(tokens),
      }
    })
  }, [options])

  // Pick initial options
  useEffect(() => {
    const value = dropdownOptions.length > 0 ? dropdownOptions[0]['value'] : null
    if (value) {
      setSelected(value.split(':'))
    } else {
      setSelected([])
    }
  }, [dropdownOptions])

  // Map all nested tokens into a single map for later reference
  const tokens = useMemo(() => {
    const all = options.reduce((acc: Token[], options) => {
      acc.push(...options)
      return acc
    }, [])

    // Remove duplicates
    return all.filter((obj, index, self) => {
      return index === self.findIndex((t) => t.address == obj.address)
    })
  }, [options])

  const inputFields = useMemo(() => {
    return selected.reduce((acc: Token[], address: string) => {
      const Token = find(tokens, { address })
      if (Token) {
        acc.push(Token)
      }
      return acc
    }, [])
  }, [selected, tokens])

  const onSelect = (addresses: string[]) => {
    setSelected(addresses)
  }

  useEffect(() => {
    setAmount1('')
    setAmount2('')
  }, [chainId, account])

  return (
    <Wrapper autoHeight={dropdownOptions.length == 1}>
      <div>
        <Dropdown options={dropdownOptions} placeholder={'Select token'} onSelect={onSelect} disabled={disabled} />
        <HorPartition />
      </div>
      <div>
        {inputFields.map((token: Token, index) => {
          const amount = index == 0 ? amount1 : amount2
          const setAmount = index == 0 ? setAmount1 : setAmount2
          const setInsufficientBalance = index == 0 ? setInsufficientBalance1 : setInsufficientBalance2

          return selected.includes(token.address) ? (
            <InputOption
              token={token}
              amount={amount}
              setAmount={setAmount}
              setInsufficientBalance={setInsufficientBalance}
              disabled={disabled}
              key={index}
            />
          ) : null
        })}
      </div>
    </Wrapper>
  )
}
