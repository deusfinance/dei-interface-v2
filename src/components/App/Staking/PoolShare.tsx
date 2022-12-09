import React from 'react'
import styled from 'styled-components'

import { useCurrencyBalance } from 'state/wallet/hooks'
import useWeb3React from 'hooks/useWeb3'
import { useCurrencyLogos } from 'hooks/useCurrencyLogo'
import { useRemoveLiquidity } from 'hooks/useStablePoolInfo'

import { formatBalance, formatDollarAmount } from 'utils/numbers'

import ImageWithFallback from 'components/ImageWithFallback'
import { LiquidityType } from 'constants/stakingPools'
import { ContentTable, Label, TableHeader, Value, VStack } from './common/Layout'
import Container from './common/Container'

const Wrapper = styled(VStack)`
  padding: 12px;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 12px;
`

export default function PoolShare({ pool }: { pool: LiquidityType }) {
  const { account } = useWeb3React()

  const { lpToken: currency } = pool
  const tokensAddress = pool.tokens.map((token) => token.address)
  const tokensLogo = useCurrencyLogos(tokensAddress)

  const depositAmount = 0
  const currencyBalance = useCurrencyBalance(account ?? undefined, currency)?.toSignificant()
  const virtualPrice = 0

  const shares = depositAmount + Number(currencyBalance)
  const amountsOut = useRemoveLiquidity(pool, shares ? shares.toString() : '0')

  return (
    <Container>
      <Wrapper>
        <TableHeader>
          <p>Your Share</p>
          <p>0.00% of Pool</p>
        </TableHeader>
        <ContentTable>
          <Label>
            <p>Balance:</p>
          </Label>
          <Value>{formatDollarAmount((depositAmount + Number(currencyBalance)) * virtualPrice)}</Value>
        </ContentTable>
        <ContentTable>
          <Label>
            <p>LP Amount:</p>
          </Label>
          <Value>{formatBalance(depositAmount + Number(currencyBalance))}</Value>
        </ContentTable>
        {tokensLogo?.map((logo, index) => (
          <ContentTable key={index}>
            <Label>
              {/* <p>{pool.tokens[index].symbol}</p> */}
              <ImageWithFallback key={index} src={logo} alt={''} width={21} height={21} />
              <p>{index === 0 ? 'DEUS' : 'vDEUS'}</p>
            </Label>
            <Value> {amountsOut[index] ? formatBalance(amountsOut[index]) : 0} </Value>
          </ContentTable>
        ))}
      </Wrapper>
    </Container>
  )
}
