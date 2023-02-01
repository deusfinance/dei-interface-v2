import styled from 'styled-components'

import Column from 'components/Column'
import { Row, RowBetween } from 'components/Row'
import useWeb3React from 'hooks/useWeb3'
import { useTokenBalances } from 'state/wallet/hooks'
import { DEI_TOKEN, BDEI_TOKEN, DEUS_TOKEN, XDEUS_TOKEN, LegacyDEI_TOKEN } from 'constants/tokens'

const Wrapper = styled(RowBetween)`
  background-color: ${({ theme }) => theme.bg1};
  padding: 20px 25px !important;
  width: 100%;
  border-radius: 12px;
  font-family: 'Inter';
`
const AccountPowerWrapper = styled(Column)`
  row-gap: 23px;
  & > p:first-of-type {
    font-family: 'Inter';
    font-size: 1.25rem;
    color: ${({ theme }) => theme.text1};
  }
  & > div {
    font-size: 0.75rem;
    & > p:first-of-type {
      color: ${({ theme }) => theme.text2};
      white-space: nowrap;
    }
    & > p:last-of-type {
      white-space: nowrap;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-image: linear-gradient(45deg, #0badf4, #30efe4);
      margin-left: 1ch;
    }
  }
`
const CoinInfoWrapper = styled(Row)`
  width: fit-content;
  column-gap: 24px;
  & > div {
    justify-content: space-between;
  }
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin-left: 150px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
      grid-template-columns: repeat(3, 1fr);
      margin-left: 100px;
      row-gap:24px;

  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
      grid-template-columns: repeat(2, 1fr);
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      grid-template-columns: repeat(1, 1fr);
  `};
`
const CoinName = styled.p`
  font-family: 'Inter';
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`
const CoinValue = styled.p<{ colorType: COLOR_TYPE }>`
font-family: 'IBM Plex Mono';
font-weight: 500;
font-size: 14px;
   background-image:${({ colorType }) =>
     colorType === COLOR_TYPE.BLUE
       ? 'linear-gradient(45deg, #0badf4, #30efe4);'
       : colorType === COLOR_TYPE.RED
       ? 'linear-gradient(90deg, #E29C53 0%, #CE4C7A 100%);'
       : 'linear-gradient(90deg, #966131 0%, #966131 100%);'}
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
   display:flex;
   column-gap:1ch;

`
const CoinItem = styled(Column)`
  row-gap: 23px;
  position: relative;
  &:after {
    content: '';
    width: 1px;
    height: 100%;
    background-color: ${({ theme }) => theme.bg4};
    position: absolute;
    right: -12px;
    transform: translateX(-12px);
    top: 0px;
  }
  &:last-of-type:after {
    content: '';
    display: none;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
     &:nth-child(3n):after {
    content: '';
    display: none;
  }
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
       &:nth-child(3n):after {
    display: inline-block;
  }
       &:nth-child(2n):after {
    display: none;
  }
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    &:after {
    display: none !important;
  }
  `};
`

enum COLOR_TYPE {
  RED = 'RED',
  BLUE = 'BLUE',
  BROWN = 'BROWN',
}

const Account = () => {
  const { account } = useWeb3React()

  const tokenBalances = useTokenBalances(
    account ?? undefined,
    [DEI_TOKEN, BDEI_TOKEN, DEUS_TOKEN, XDEUS_TOKEN, LegacyDEI_TOKEN] ?? undefined
  )

  const coins = [
    {
      id: 0,
      name: DEI_TOKEN.symbol,
      image: '',
      value: tokenBalances[DEI_TOKEN.address]?.toSignificant(3) ?? 'N/A',
      colorType: COLOR_TYPE.RED,
    },
    {
      id: 1,
      name: BDEI_TOKEN.symbol,
      image: '',
      value: tokenBalances[BDEI_TOKEN.address]?.toSignificant(3) ?? 'N/A',
      colorType: COLOR_TYPE.RED,
    },
    {
      id: 2,
      name: DEUS_TOKEN.symbol,
      image: '',
      value: tokenBalances[DEUS_TOKEN.address]?.toSignificant(2) ?? 'N/A',
      colorType: COLOR_TYPE.BLUE,
    },
    {
      id: 3,
      name: XDEUS_TOKEN.symbol,
      image: '',
      value: tokenBalances[XDEUS_TOKEN.address]?.toSignificant(2) ?? 'N/A',
      colorType: COLOR_TYPE.BLUE,
    },
    {
      id: 4,
      name: LegacyDEI_TOKEN.symbol,
      image: '',
      value: tokenBalances[LegacyDEI_TOKEN.address]?.toSignificant(3) ?? 'N/A',
      colorType: COLOR_TYPE.BROWN,
    },
  ]

  return (
    <Wrapper>
      <AccountPowerWrapper>
        <p>My Account</p>
        {/* <Row>
          <p>My Voting Power:</p>
          <p> N/A veDEUS</p>
        </Row> */}
      </AccountPowerWrapper>
      <CoinInfoWrapper>
        {coins.map((coin) => (
          <CoinItem key={coin.id}>
            <Row>
              <CoinName>{coin.name}</CoinName>
            </Row>
            <CoinValue colorType={coin.colorType}>
              <p>{coin.value}</p>
              <p>{coin.name}</p>
            </CoinValue>
          </CoinItem>
        ))}
      </CoinInfoWrapper>
    </Wrapper>
  )
}

export default Account
