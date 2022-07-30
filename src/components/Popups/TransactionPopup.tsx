import React from 'react'
import styled, { useTheme } from 'styled-components'

import useWeb3React from 'hooks/useWeb3'
import { ExplorerDataType } from 'utils/explorers'
import { FALLBACK_CHAIN_ID } from 'constants/chains'
import { ExplorerLink } from 'components/Link'
import { CheckMark, Close, Link, Error } from 'components/Icons'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-family: 'IBM Plex Mono';
  font-weight: 400;
  font-size: 12px;
`

const SuccessBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;

  border-radius: 10px;
  padding: 0.8rem;
  font-size: 0.8rem;
  line-height: 2rem;
  color: ${({ theme }) => theme.primary2};
  margin-right: 8px;

  & > * {
    &:first-child {
      margin-right: 0.5rem;
    }
    &:last-child {
      margin-left: auto;
    }
  }
`

const TopBorderWrap = styled.div<{ active?: any }>`
  background: ${({ theme }) => theme.primary2};
  padding: 1px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.bg0};
  flex: 1;
  height: 80px;
  width: 316px;
`

const TopBorder = styled.div`
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 12px;
  height: 100%;
  width: 100%;
  display: flex;
`

const Connected = styled.button`
  cursor: default;
  background: ${({ theme }) => theme.specialBG1};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.7rem;
  `};
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
      <SuccessBox>
        <Header>{summary}</Header>
        <ExplorerLink chainId={chainId ?? FALLBACK_CHAIN_ID} type={ExplorerDataType.TRANSACTION} value={hash}>
          <Link />
        </ExplorerLink>

        {success ? (
          <CheckMark size={12} style={{ marginRight: '6px' }} />
        ) : (
          <Error size={12} color={'red'} style={{ marginRight: '6px' }} />
        )}
      </SuccessBox>
    )
  }

  const getBox = () => {
    return (
      <SuccessBox color={success ? theme.success : theme.error}>
        <Connected disabled>Transaction {success ? 'successful' : 'failed'}</Connected>
        <Close onClick={removeThisPopup} size={'24'} />
      </SuccessBox>
    )
  }

  return (
    <TopBorderWrap>
      <TopBorder>
        <Wrapper>
          {getBox()}
          {getHeader()}
        </Wrapper>
      </TopBorder>
    </TopBorderWrap>
  )
}
