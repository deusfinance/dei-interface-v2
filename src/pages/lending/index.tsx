import React, { useCallback } from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
import { RowCenter } from 'components/Row'
import { useRouter } from 'next/router'
import TokenBox from 'components/App/Lending/TokenBox'
import InfoCell from 'components/App/Lending/InfoCell'
// import AssetsBox from 'components/App/Lending/AssetsBox'
import { default as CollateralTable } from 'components/App/Lending/CollateralTable'
import { default as AssetsTable } from 'components/App/Lending/AssetsTable'

import { LendingPoolType, LendingPool } from 'constants/lendingPools'
import { isMobile } from 'react-device-detect'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled(RowCenter)`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 20px;
  font-size: 14px;
  cursor: pointer;
`

const StakeBox = styled.div`
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  width: 100%;
  height: 100px;
  padding: 20px;
  align-items: center;
`

const DisableCell = styled.div`
  flex-basis: 12%;
`

const TablesWrapper = styled.div`
  display: flex;
`

const CollateralWrap = styled.div`
  padding: 5px;
`
const AssetsWrap = styled.div`
  padding: 5px;
`

export default function Lending() {
  const router = useRouter()

  const snapshotList = LendingPool

  const handleClick = useCallback(
    (pid) => {
      router.push(`/lending/${pid}`)
    },
    [router]
  )

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <TablesWrapper>
        <CollateralWrap>
          <CollateralTable pools={snapshotList as LendingPoolType[]} isMobile={isMobile} isLoading={true} />
        </CollateralWrap>
        <AssetsWrap>
          <AssetsTable pools={snapshotList as LendingPoolType[]} isMobile={isMobile} isLoading={true} />
        </AssetsWrap>
      </TablesWrapper>

      {LendingPool.map((pool, index) => {
        const { id, name, collaterals, assets } = pool
        return (
          <TopWrapper key={index} onClick={() => handleClick(id)}>
            <StakeBox>
              <TokenBox tokens={collaterals} title={name} />
              <TokenBox tokens={assets} />
              {/* <AssetsBox tokens={assets} /> */}
              <InfoCell title={'Pool Number'} text={id.toString()} />
              <InfoCell title={'Total supplied'} text={'$128671m'} />
              <InfoCell title={'Total borrowed'} text={'$123761238m'} />
            </StakeBox>
          </TopWrapper>
        )
      })}

      <div style={{ marginTop: '20px' }}></div>

      <Disclaimer />
    </Container>
  )
}
