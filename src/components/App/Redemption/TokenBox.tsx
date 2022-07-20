import styled from 'styled-components'
import Image from 'next/image'

import { RowBetween, RowStart } from 'components/Row'
import { formatBalance } from 'utils/numbers'

const TokenInfo = styled.div`
  color: ${({ theme }) => theme.bg0};
  &:hover {
    color: ${({ theme }) => theme.bg1};
  }
`
const TokenName = styled.div`
  font-size: 14px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
`
const Amount = styled.div`
  font-size: 12px;
  margin-left: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
`
export const TokenBox = ({
  symbol,
  logo,
  amount,
}: {
  symbol: string | null
  logo: StaticImageData | string
  amount?: number | null
}): JSX.Element => {
  return (
    <>
      <TokenInfo>
        <RowBetween>
          <RowStart alignItems="center">
            <Image width="20px" height="20px" src={logo} alt={'DEUS'} />
            <TokenName>{symbol}</TokenName>
          </RowStart>
          <Amount>{formatBalance(amount ?? '')}</Amount>
        </RowBetween>
      </TokenInfo>
    </>
  )
}
