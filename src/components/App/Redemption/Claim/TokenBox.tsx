import styled from 'styled-components'
import Image from 'next/image'

import { RowBetween, RowStart } from 'components/Row'

import ClaimButton from './ClaimButton'
import { formatBalance } from 'utils/numbers'
import DEUS_LOGO from '/public/static/images/tokens/deus.svg'

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
  const logo = DEUS_LOGO
  return (
    <>
      <TokenInfo>
        <RowBetween>
          <RowStart alignItems="center">
            <Image width="20px" height="20px" src={logo} alt={'DEUS'} />
            <TokenName>{symbol}</TokenName>
          </RowStart>
          <Amount>{amount ? formatBalance(amount) : ''}</Amount>
        </RowBetween>
        <RowBetween mt={'15px'}>
          <ClaimButton
            claimableBlock={claimableBlock}
            currentBlock={currentBlock}
            onClaim={onClaim}
            onSwitchNetwork={onSwitchNetwork}
          />
        </RowBetween>
      </TokenInfo>
    </>
  )
}
