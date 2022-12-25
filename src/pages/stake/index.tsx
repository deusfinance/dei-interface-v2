import React, { useMemo } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import Hero from 'components/Hero'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/stake/ic_stake.svg'
import { RowBetween } from 'components/Row'
// import TokenBox from 'components/App/Stake/TokenBox'
import { Stakings } from 'constants/stakingPools'
// import InfoCell from 'components/App/Stake/InfoCell'
// import RewardBox from 'components/App/Stake/RewardBox'
import { useSearch, SearchField } from 'components/App/Stake/Search'
import Table from 'components/App/Stake/Table'

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
  background: ${({ theme }) => theme.bg0};
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;

  & > * {
    margin: 10px 10px;
  }
`

const FirstRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  @media (max-width: 768px) {
    width: 50%;
  }
`

export default function Stake() {
  // FIXME: This should be implemented for staking
  const { snapshot, searchProps } = useSearch()
  const snapshotList = useMemo(() => {
    return snapshot.options.map((obj) => {
      return obj.value
    })
  }, [snapshot])

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
          <div>
            <SearchField searchProps={searchProps} />
          </div>
        </UpperRow>
      )
    }
  }

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <Wrapper>
        {getUpperRow()}
        <Table isMobile={isMobile} stakings={Stakings} />
      </Wrapper>
    </Container>
  )
}
