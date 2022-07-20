import React, { useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import useWeb3React from 'hooks/useWeb3'
import { ChainInfo } from 'constants/chainInfo'

import { NavButton } from 'components/Button'
import { SolidlyChains } from 'constants/chains'

const Button = styled(NavButton)`
  background: transparent;
  justify-content: space-between;
  gap: 5px;

  &:focus,
  &:hover {
    cursor: default;
    border: 1px solid ${({ theme }) => theme.border2};
  }
`

const Text = styled.p`
  width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
`

export default function Web3Network() {
  const { account, chainId } = useWeb3React()

  const Chain = useMemo(() => {
    return chainId && chainId in ChainInfo ? ChainInfo[chainId] : null
  }, [chainId])

  if (!account || !chainId || !Chain || !SolidlyChains.includes(chainId)) {
    return null
  }

  return (
    <Button>
      <Image src={Chain.logoUrl} alt={Chain.label} width={20} height={20} />
      <Text>{Chain.label}</Text>
    </Button>
  )
}
