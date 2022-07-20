import React from 'react'
import styled, { useTheme } from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { ExplorerDataType } from 'utils/explorers'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { ExplorerLink } from 'components/Link'
import { CheckMark, Copy as CopyIcon, Close } from 'components/Icons'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
  padding: 1rem 1.25rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: ${({ theme }) => theme.text2};
`

const SuccessBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  margin-top: 1rem;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 10px;
  height: 2rem;
  padding: 0.8rem;
  font-size: 0.8rem;
  line-height: 2rem;
  color: ${({ theme }) => theme.primary2};

  & > * {
    &:first-child {
      margin-right: 0.5rem;
    }
    &:last-child {
      margin-left: auto;
    }
  }
`

export default function TransactionPopup({
  hash,
  success,
  summary,
  removeThisPopup,
}: {
  hash: string
  success?: boolean
  summary?: string
  removeThisPopup: () => void
}) {
  const { chainId } = useWeb3React()
  const theme = useTheme()

  const getHeader = () => {
    return (
      <Header>
        {summary}
        <Close onClick={removeThisPopup} />
      </Header>
    )
  }

  const getBox = () => {
    return (
      <ExplorerLink chainId={chainId ?? FALLBACK_CHAIN_ID} type={ExplorerDataType.TRANSACTION} value={hash}>
        <SuccessBox color={success ? theme.success : theme.error}>
          <CheckMark color={success ? theme.success : theme.error} />
          Transaction {success ? 'successful' : 'failed'}
          <CopyIcon size={12} color={theme.text1} />
        </SuccessBox>
      </ExplorerLink>
    )
  }

  return (
    <Wrapper>
      {getHeader()}
      {getBox()}
    </Wrapper>
  )
}
