import styled from 'styled-components'
import Image from 'next/image'

import { AutoRow, RowBetween, RowStart } from 'components/Row'

import ClaimButton from './ClaimButton'
import { formatBalance } from 'utils/numbers'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { getRemainingTime } from 'utils/time'
import { IToken } from '.'
import Column from 'components/Column'
import { NetworkText } from '../InputBox'
import { SupportedChainId } from 'constants/chains'

const TokenInfo = styled.div`
  color: ${({ theme }) => theme.bg0};
  padding: 15px 15px;
  border: 1px solid ${({ theme }) => theme.border3};
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  margin-bottom: 10px;

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

const SubAmount = styled.div`
  font-size: 13px;
  margin-left: 6px;
  color: ${({ theme }) => theme.text2};
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
  token,
  currentBlock,
  onSwitchNetwork,
  onClaim,
}: {
  token: IToken
  currentBlock: number
  onSwitchNetwork?: () => void
  onClaim?: () => void
}): JSX.Element => {
  const { symbol, claimableBlock, amount } = token
  const logo = useCurrencyLogo(symbol ?? 'usdc')

  const isWaiting = claimableBlock - currentBlock > 0
  const { hours, minutes, seconds } = getRemainingTime(claimableBlock * 1000)

  return (
    <TokenInfo>
      <TokenRow isWaiting={isWaiting}>
        <RowStart alignItems="center">
          <Image width="26px" height="25px" src={logo} alt={'DEUS'} />
          <Column>
            <AutoRow>
              <Amount>{amount ? formatBalance(amount) : ''}</Amount>
              <TokenName type={symbol ?? 'DEUS'}>{symbol}</TokenName>
            </AutoRow>
            <SubAmount>
              <NetworkText network={token.chainId === SupportedChainId.FANTOM}>
                {SupportedChainId[token.chainId]}
              </NetworkText>
            </SubAmount>
          </Column>
        </RowStart>
      </TokenRow>

      <TokenRowRight>
        <ClaimButton
          token={token}
          claimableBlock={claimableBlock}
          currentBlock={currentBlock}
          onClaim={onClaim}
          onSwitchNetwork={onSwitchNetwork}
        />
      </TokenRowRight>
    </TokenInfo>
  )
}
