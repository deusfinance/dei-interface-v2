import styled from 'styled-components'
import Image from 'next/image'

import { RowBetween, RowStart } from 'components/Row'

import ClaimButton from './ClaimButton'
import { formatBalance } from 'utils/numbers'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { getRemainingTime } from 'utils/time'

const TokenInfo = styled.div<{ isFirst?: boolean; isLast?: boolean }>`
  color: ${({ theme }) => theme.bg0};
  padding: 15px 15px;
  border-bottom: 2px solid ${({ theme, isLast }) => (isLast ? 'transparent' : theme.border3)};
  background: ${({ theme, isFirst }) => (isFirst ? theme.bg1 : theme.bg2)};
  border-radius: 12px;

  &:hover {
    color: ${({ theme }) => theme.bg1};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-direction: row;
  `}
`

const TokenRow = styled(RowBetween)<{ isWaiting?: boolean }>`
  opacity: ${({ isWaiting }) => (isWaiting ? '0.4' : '1')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 0;
    flex: 2;
  `}
`

const TokenName = styled.div<{ type: string }>`
  font-size: 12px;
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
  font-size: 16px;
  margin-left: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
`

const TimeSpan = styled.span`
  color: ${({ theme }) => theme.text1};
  white-space: nowrap;
  font-size: 12px;
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
  isFirst = true,
  isLast = true,
}: {
  symbol: string | null
  claimableBlock: number
  currentBlock: number
  amount?: number | null
  onSwitchNetwork?: () => void
  onClaim?: () => void
  isFirst?: boolean
  isLast?: boolean
}): JSX.Element => {
  const logo = useCurrencyLogo(symbol ?? 'usdc')

  const isWaiting = claimableBlock - currentBlock > 0
  const { hours, minutes, seconds } = getRemainingTime(claimableBlock * 1000)

  return (
    <TokenInfo isFirst={isFirst} isLast={isLast}>
      <TokenRow isWaiting={isWaiting}>
        <RowStart alignItems="center">
          <Image width="26px" height="25px" src={logo} alt={'DEUS'} />
          <Amount>{amount ? formatBalance(amount) : ''}</Amount>
          <TokenName type={symbol ?? 'USDC'}>{symbol}</TokenName>
        </RowStart>
        {!isFirst && (
          <>{isWaiting ? <TimeSpan>in {`${hours}:${minutes}:${seconds}`}</TimeSpan> : <TimeSpan>ready</TimeSpan>}</>
        )}
      </TokenRow>
      {isFirst && (
        <TokenRowRight>
          <ClaimButton
            claimableBlock={claimableBlock}
            currentBlock={currentBlock}
            onClaim={onClaim}
            onSwitchNetwork={onSwitchNetwork}
            isUSDC={symbol === 'USDC'}
          />
        </TokenRowRight>
      )}
    </TokenInfo>
  )
}
