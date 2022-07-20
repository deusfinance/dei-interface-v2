import { Row } from 'components/Row'
import React from 'react'
import styled from 'styled-components'

import { PrimaryButton } from 'components/Button'
import ImageWithFallback from 'components/ImageWithFallback'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { Loader } from 'components/Icons'
// import { formatDollarAmount } from 'utils/numbers'
import { BDEI_ADDRESS } from '../../../constants/addresses'
import { SupportedChainId } from 'constants/chains'

const Wrapper = styled.div`
  background-color: rgb(13 13 13);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  & > * {
    text-align: center;
    /* ${({ theme }) => theme.mediaWidth.upToMedium`
      margin-top: 30px;
  `} */
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    & > * {
    &:nth-child(1) {
      width: 100%;
      max-width: 100%;
    }

    &:nth-child(4) {
      width: 100%;
      margin-top: 20px;
      max-width: 100%;
      flex-direction: row;
    }
  }
  `}
`

const Name = styled.div`
  font-size: 22px;
  font-weight: bold;
  white-space: nowrap;
  max-width: 25%;
`

const Coins = styled.div`
  display: flex;
  white-space: nowrap;
  flex-direction: column;
  max-width: 25%;
`

const PoolInfo = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 25%;
`

const InfoTitle = styled.div`
  color: rgb(101, 101, 101);
  font-size: 16px;
`

const WithdrawButton = styled(PrimaryButton)`
  border-radius: 4px;
  width: 160px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 40px;
  `}
`

const DepositButton = styled(WithdrawButton)`
  margin-bottom: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-bottom: 0;
    margin-right: 16px;
  `}
`

const ItemValue = styled.div`
  color: white;
  margin-left: 5px;
  font-size: 20px;
  font-weight: 400;
`

const SymbolText = styled.div`
  margin-left: 10px;
`

export default function PoolOverview() {
  const showLoader = false

  return (
    <Wrapper>
      <Name> DEI-BDEI </Name>
      <Coins>
        <Row>
          <BalanceRow address={'DEI'} symbol="DEI" />
        </Row>
        <Row>
          <BalanceRow address={BDEI_ADDRESS[SupportedChainId.FANTOM]} symbol="bDEI" />
        </Row>
      </Coins>
      {/* <PoolInfo>
        <InfoTitle>TVL</InfoTitle>
        <ItemValue>{showLoader ? <Loader /> : formatDollarAmount(5124305)}</ItemValue>
      </PoolInfo> */}
      {/* <PoolInfo>
        <InfoTitle>24h Volume</InfoTitle>
        <ItemValue>{showLoader ? <Loader /> : formatDollarAmount(1646501)}</ItemValue>
      </PoolInfo> */}
      <PoolInfo>
        <InfoTitle>APR</InfoTitle>
        <ItemValue>{showLoader ? <Loader /> : '13.2%'}</ItemValue>
      </PoolInfo>
      <PoolInfo>
        <DepositButton active>Deposit</DepositButton>
        <WithdrawButton active disabled>
          Withdraw
        </WithdrawButton>
      </PoolInfo>
    </Wrapper>
  )
}

function BalanceRow({ address, symbol }: { address: string; symbol: string }) {
  const logo = useCurrencyLogo(address)
  return (
    <Row>
      <ImageWithFallback src={logo} alt={`${symbol} logo`} width={40} height={40} />
      <SymbolText>{symbol}</SymbolText>
    </Row>
  )
}
