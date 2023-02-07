import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { Row, RowBetween } from 'components/Row'
import { useSearch, SearchField } from 'components/App/Stake/Search'
import Table from 'components/App/Stake/Table'
import { ExternalStakings, Stakings, StakingType } from 'constants/stakingPools'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1168px);
  margin-top: 30px;

  & > * {
    &:nth-child(3) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const UpperRow = styled(RowBetween)`
  background: ${({ theme }) => theme.bg1};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 2px;
  & > * {
    margin: 8px 8px;
  }
`

const FirstRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 50%;
  `};
`
const Cell = styled.div<{ justify?: boolean }>`
  align-items: center;
  text-align: center;
  vertical-align: middle;
  padding: 5px;
  height: 90px;
`
export default function Stake() {
  const { snapshot, searchProps } = useSearch(Stakings, ExternalStakings)
  const result = snapshot.options.map((stakings) => stakings)
  useWeb3NavbarOption({ network: true, wallet: true })

  function getUpperRow() {
    if (isMobile) {
      return (
        <UpperRow>
          <FirstRowWrapper>
            <SearchField searchProps={searchProps} />
          </FirstRowWrapper>
        </UpperRow>
      )
    } else {
      return (
        <UpperRow>
          <Row>
            <Cell style={{ height: 'fit-content', width: '25%' }}>
              <SearchField searchProps={searchProps} />
            </Cell>
            <Cell style={{ height: 'fit-content', color: '#FFBA93', fontWeight: 'medium', width: '10%' }}>APR</Cell>
            <Cell style={{ height: 'fit-content', color: '#6F7380', width: '18%' }}>TVL</Cell>
            <Cell style={{ height: 'fit-content', textAlign: 'left', color: '#6F7380' }}>Reward Tokens</Cell>
          </Row>
        </UpperRow>
      )
    }
  }

  return (
    <Container>
      <Wrapper>
        {getUpperRow()}
        <Table isMobile={isMobile} stakings={result as unknown as StakingType[]} />
      </Wrapper>
    </Container>
  )
}
