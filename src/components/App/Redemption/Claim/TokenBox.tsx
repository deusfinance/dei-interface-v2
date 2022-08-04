import styled from 'styled-components'
import Image from 'next/image'

import { RowBetween, RowStart } from 'components/Row'

import ClaimButton from './ClaimButton'
import { formatBalance } from 'utils/numbers'
import useCurrencyLogo from 'hooks/useCurrencyLogo'

const TokenInfo = styled.div`
  color: ${({ theme }) => theme.bg0};
  &:hover {
    color: ${({ theme }) => theme.bg1};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-direction: row;
  `}
`

const TokenName = styled.div<{ type: string }>`
  font-size: 14px;
  margin-left: 5px;
  color: ${({ theme, type }) => (type === 'USDC' ? '#56A5FA' : theme.text1)};
  ${({ type }) =>
    type === 'DEUS' &&
    `
    background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

const Amount = styled.div`
  font-size: 12px;
  margin-left: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
`

const TokenRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0;
    flex: 2;
  `}
`

const TokenRowRight = styled(RowBetween)`
  margin-top: 15px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0;
    flex: 1;
  `}
`

export const TokenBox = ({
  symbol,
  claimableBlock,
  currentBlock,
  amount,
  onSwitchNetwork,
  onClaim,
}: {
  symbol: string | null
  claimableBlock?: number
  currentBlock?: number
  amount?: number | null
  onSwitchNetwork?: () => void
  onClaim?: () => void
}): JSX.Element => {
  const logo = useCurrencyLogo(symbol ?? 'usdc')
  return (
    <>
      <TokenInfo>
        <TokenRow>
          <RowStart alignItems="center">
            <Image width="20px" height="20px" src={logo} alt={'DEUS'} />
            <Amount>{amount ? formatBalance(amount) : ''}</Amount>
            <TokenName type={symbol ?? 'USDC'}>{symbol}</TokenName>
          </RowStart>
        </TokenRow>
        <TokenRowRight>
          <ClaimButton
            claimableBlock={claimableBlock}
            currentBlock={currentBlock}
            onClaim={onClaim}
            onSwitchNetwork={onSwitchNetwork}
            isUSDC={symbol === 'USDC'}
          />
        </TokenRowRight>
      </TokenInfo>
    </>
  )
}
