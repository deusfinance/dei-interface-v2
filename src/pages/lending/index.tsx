import React, { useCallback } from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
import { RowCenter } from 'components/Row'
import { useRouter } from 'next/router'
import { LendingPool } from 'constants/lendingPools'
import TokenBox from 'components/App/Lending/TokenBox'
import InfoCell from 'components/App/Lending/InfoCell'
import AssetsBox from 'components/App/Lending/AssetsBox'

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

export default function Stake() {
  const router = useRouter()

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

      {LendingPool.map((pool, index) => {
        const { id, name, collaterals, assets } = pool
        return (
          <TopWrapper key={index} onClick={() => handleClick(id)}>
            <StakeBox>
              <TokenBox tokens={collaterals} title={name} />
              <AssetsBox tokens={assets} />
              <InfoCell title={'APR'} text={'4%'} />
              <InfoCell title={'TVL'} text={'$4.58m'} />
              {/* <InfoCell title={'Your Stake'} text={`1.38 ${lpToken.symbol}`} size={'22%'} /> */}
            </StakeBox>
          </TopWrapper>
        )
      })}

      <div style={{ marginTop: '20px' }}></div>

      <Disclaimer />
    </Container>
  )
}
