import React, { useCallback } from 'react'
import styled from 'styled-components'

import Hero from 'components/Hero'
// import ImageWithFallback from 'components/ImageWithFallback'
// import STAKE_ICON from '/public/static/images/pages/ic_stake.svg'
import { RowCenter } from 'components/Row'
import TokenBox from 'components/App/Stake/TokenBox'
import { Stakings } from 'constants/stakingPools'
import InfoCell from 'components/App/Stake/InfoCell'
import RewardBox from 'components/App/Stake/RewardBox'
import { useRouter } from 'next/router'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled(RowCenter)<{ active: boolean }>`
  flex-wrap: wrap;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 20px;
  font-size: 14px;
  cursor: ${({ active }) => (active ? 'pointer' : 'not-allowed')};
`

const StakeBox = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  width: 100%;
  height: 100px;
  padding: 20px;
  align-items: center;

  & > * {
    opacity: ${({ active }) => (active ? '1' : '0.4')};
  }
`

const DisableCell = styled.div`
  flex-basis: 12%;
`

export default function Stake() {
  const router = useRouter()

  const handleClick = useCallback(
    (pid) => {
      router.push(`/stake/${pid}`)
    },
    [router]
  )

  return (
    <Container>
      <Hero>{/* <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} /> */}</Hero>

      {Stakings.map((staking, index) => {
        const { pid, tokens, lpToken, rewardTokens, active, name } = staking
        return (
          <TopWrapper key={index} active={active} onClick={active ? () => handleClick(pid) : undefined}>
            <StakeBox active={active}>
              <TokenBox tokens={tokens} title={name} />
              {active ? <InfoCell title={'APR'} text={'4%'} /> : <DisableCell>Disable</DisableCell>}
              <InfoCell title={'TVL'} text={'$4.58m'} />
              <InfoCell title={'Your Stake'} text={`1.38 ${lpToken.symbol}`} size={'22%'} />
              <RewardBox tokens={rewardTokens} />
            </StakeBox>
          </TopWrapper>
        )
      })}
    </Container>
  )
}
