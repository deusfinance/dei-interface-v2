import { Token } from '@sushiswap/core-sdk'
import { Row } from 'components/Row'
import styled from 'styled-components'
import ItemBox from './ItemBox'

const Wrapper = styled.div`
  width: 100%;
`

const TokensWrap = styled(Row)`
  height: 56px;
  cursor: pointer;

  & > * {
    &:first-child {
      border-radius: 12px 0px 0px 12px;
      & > * {
        border-radius: 12px 0px 0px 12px;
      }
    }
    &:last-child {
      border-radius: 0px 12px 12px 0px;
      & > * {
        border-radius: 0px 12px 12px 0px;
      }
    }
  }
`

const Title = styled.div`
  font-family: 'IBM Plex Mono';
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
  margin-bottom: 12px;
`

export default function TokensBox({
  title,
  tokens,
  selectedToken,
  onTokenSelect,
}: {
  title: string
  tokens: Token[]
  selectedToken: Token
  onTokenSelect: (token: Token) => void
}) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <TokensWrap>
        {tokens.map((token, index) => {
          return (
            <ItemBox
              key={index}
              token={token}
              active={token.name === selectedToken.name}
              onTokenSelect={onTokenSelect}
            />
          )
        })}
      </TokensWrap>
    </Wrapper>
  )
}
