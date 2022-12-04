import React from 'react'
import styled from 'styled-components'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
// import { useUserInfo } from 'hooks/useStakingInfo'
import { useRemoveLiquidity } from 'hooks/useStablePoolInfo'

import { formatBalance, formatDollarAmount } from 'utils/numbers'

import ImageWithFallback from 'components/ImageWithFallback'
import { LiquidityType } from 'constants/stakingPools'

const Wrapper = styled.div`
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text2};
  border: 1px solid ${({ theme }) => theme.bg0};
  white-space: nowrap;
  gap: 10px;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 12px;
  margin-top: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0.5rem;
  `}

  &>* {
    margin-bottom: 10px;
  }
`

const Col = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  color: ${({ theme }) => theme.text1};
  font-size: 20px;
`

const Col2 = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  font-size: 16px;
`

const LeftTitle = styled.div`
  color: ${({ theme }) => theme.text1};
`

const TokenTitle = styled.div`
  color: ${({ theme }) => theme.text1};
  margin-top: 6px;
`

const RightTitle = styled.div`
  color: ${({ theme }) => theme.text1};
`

const Col3 = styled.div`
  display: flex;
  gap: 12px;
`

const TokenBalance = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`

const TokenBalanceValue = styled.div`
  display: inline-block;
  vertical-align: middle;
  color: ${({ theme }) => theme.text1};
  margin-top: 8px;
`

const Title = styled.div`
  font-size: 20px;
  font-weight: 100;
  font-family: 'Space Grotesk';
  color: ${({ theme }) => theme.text1};
`

export default function PoolShare({ pool }: { pool: LiquidityType }) {
  const { account } = useWeb3React()

  const { lpToken: currency } = pool
  const tokensAddress = pool.tokens.map((token) => token.address)
  const tokensLogo = useCurrencyLogos(tokensAddress)

  // const { depositAmount } = useUserInfo(pool)
  const depositAmount = 0
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency)?.toSignificant()
  // const { virtualPrice } = useGlobalSyncPoolDate(pool)
  const virtualPrice = 0

  const shares = depositAmount + Number(currencyBalance)
  const amountsOut = useRemoveLiquidity(pool, shares ? shares.toString() : '0')

  return (
    <Wrapper>
      <Col>
        <Title>Your Share</Title>
        <RightTitle> 0.00% of Pool </RightTitle>
      </Col>
      <Col2>
        <LeftTitle>Balance:</LeftTitle>
        <RightTitle> {formatDollarAmount((depositAmount + Number(currencyBalance)) * virtualPrice)} </RightTitle>
      </Col2>
      <Col2>
        <LeftTitle>LP Amount:</LeftTitle>
        <RightTitle> {formatBalance(depositAmount + Number(currencyBalance))} </RightTitle>
      </Col2>
      {tokensLogo?.map((logo, index) => (
        <TokenBalance key={index}>
          <Col3>
            <ImageWithFallback key={index} src={logo} alt={''} width={36} height={36} />
            <TokenTitle>{pool.tokens[index].symbol}</TokenTitle>
          </Col3>
          <TokenBalanceValue> {amountsOut[index] ? formatBalance(amountsOut[index]) : 0} </TokenBalanceValue>
        </TokenBalance>
      ))}
    </Wrapper>
  )
}
