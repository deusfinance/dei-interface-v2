import React from 'react'
import styled from 'styled-components'

import { useSolidPrice } from 'hooks/useCoingeckoPrice'
import { SolidlyPair } from 'apollo/queries'
import { formatDollarAmount } from 'utils/numbers'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { useSearch, SearchField, Table } from 'components/App/Liquidity'
import { RowEnd } from 'components/Row'
import Box from 'components/Box'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1400px);

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

const UpperRow = styled(RowEnd)`
  gap: 10px;
  margin-bottom: 10px;
  height: 50px;
  & > * {
    height: 100%;
    max-width: fit-content;
    &:first-child {
      max-width: 400px;
      margin-right: auto;
    }

    ${({ theme }) => theme.mediaWidth.upToMedium`
      &:nth-child(2) {
        display: none;
      }
    `}
  }
`

export default function Liquidity() {
  const { snapshot, searchProps } = useSearch()
  const solidPrice = useSolidPrice()

  return (
    <Container>
      <Hero>
        <div>Solidly LP</div>
        <HeroSubtext>Available pools on the Solidly AMM.</HeroSubtext>
      </Hero>
      <Wrapper>
        <UpperRow>
          <SearchField searchProps={searchProps} />
          <Box>SOLID Price: {formatDollarAmount(parseFloat(solidPrice), 2)}</Box>
        </UpperRow>
        <Table options={snapshot.options as unknown as SolidlyPair[]} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
