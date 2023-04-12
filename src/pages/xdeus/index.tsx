import ConvertPage from 'components/App/XDeus/ConvertPage'
import SingleChart from 'components/App/XDeus/SingleChart'
import { RowBetween } from 'components/Row'
import useDeusMarketCapStats from 'hooks/useMarketCapStats'
import { useXDeusStats } from 'hooks/useXDeusStats'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import styled from 'styled-components'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

const Wrapper = styled(RowBetween)`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 16px auto;
  gap: 16px;
`

const HeaderWrapper = styled(RowBetween)`
  background-color: ${({ theme }) => theme.bg1};
  padding: 24px !important;
  width: 100%;
  border-radius: 12px;
  font-family: 'Inter';
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
  `};
`

const HeaderTitle = styled.div`
  font-family: 'Inter';
  font-weight: 500;
  font-size: 20px;
  display: flex;
`
const StatsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`
const Stat = styled.div`
  display: flex;
  flex-direction: row;
`
const Title = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text4};
  margin-right: 12px;
`

const Value = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
`

const SwapWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
`

export default function XDeus() {
  useWeb3NavbarOption({ network: true, wallet: true, reward: true })

  const { deusPrice, xDeusTotalSupply } = useDeusMarketCapStats()
  const { swapRatio } = useXDeusStats()

  return (
    <Wrapper>
      <HeaderWrapper>
        <HeaderTitle>DEUS / xDEUS Converter</HeaderTitle>
        <StatsWrapper>
          <Stat>
            <Title>DEUS Price:</Title>
            <Value>{formatDollarAmount(deusPrice)}</Value>
          </Stat>
          <Stat>
            <Title>xDEUS Ratio:</Title>
            <Value>{swapRatio.toFixed(3)}</Value>
          </Stat>
          <Stat>
            <Title>xDEUS Total Supply:</Title>
            <Value>{formatAmount(xDeusTotalSupply)}</Value>
          </Stat>
        </StatsWrapper>
      </HeaderWrapper>
      <SwapWrapper>
        <SingleChart label={'xDEUS Ratio'} />
        <ConvertPage />
      </SwapWrapper>
    </Wrapper>
  )
}
