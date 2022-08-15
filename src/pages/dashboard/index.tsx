import React, { useMemo } from 'react'
import styled from 'styled-components'
import Image from 'next/image'

import MINT_LOGO from '/public/static/images/pages/dashboard/ic_mint_gray.svg'
import MINT_HOVER_LOGO from '/public/static/images/pages/dashboard/ic_mint_hover.svg'
import REDEEM_LOGO from '/public/static/images/pages/dashboard/ic_redeem_gray.svg'
import REDEEM_HOVER_LOGO from '/public/static/images/pages/dashboard/ic_redeem_hover.svg'
import BOND_LOGO from '/public/static/images/pages/dashboard/ic_bond_gray.svg'
import BOND_HOVER_LOGO from '/public/static/images/pages/dashboard/ic_bond_hover.svg'
import ANALYTICS_LOGO from '/public/static/images/pages/dashboard/ic_analytics_gray.svg'
import ANALYTICS_HOVER_LOGO from '/public/static/images/pages/dashboard/ic_analytics_hover.svg'
import VEDEUS_LOGO from '/public/static/images/pages/dashboard/ic_vedeus_gray.svg'
import VEDEUS_HOVER_LOGO from '/public/static/images/pages/dashboard/ic_vedeus_hover.svg'
import DEI_LOGO from '/public/static/images/pages/dashboard/DEI_Dashboard.png'

import { useDeiStats } from 'hooks/useDeiStats'
import useWeb3React from 'hooks/useWeb3'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

import Hero from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import { Container } from 'components/App/StableCoin'
import { RowBetween, RowCenter } from 'components/Row'
import { Card } from 'components/App/Dashboard/card'
import { SocialCard } from 'components/App/Dashboard/SocialCard'
import Stats from 'components/App/Dashboard/Stats'
import DeiBondStats from 'components/App/Dashboard/DeiBondStats'

const Wrapper = styled(RowCenter)`
  max-width: 1300px;
  margin-top: 28px;
  gap: 20px;
  flex-wrap: wrap;
  border-radius: 15px;
  width: 100%;
  overflow: hidden;
  padding: 0 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  gap: 10px;
`};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  gap: 8px;
`};

  & > * {
    width: 100%;
  }
`

const CardWrapper = styled(RowBetween)`
  width: 100%;
  flex-wrap: wrap;
  gap: 20px;
  & > * {
    flex: 1;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  gap: 12px;
`};
`

export default function Dashboard() {
  const { account } = useWeb3React()
  const { totalSupply, totalUSDCReserves } = useDeiStats()

  const items = useMemo(
    () => [
      { name: 'DEI Price', value: '$1.00' },
      { name: 'DEI Total Supply', value: formatDollarAmount(totalSupply, 2) ?? '-' },
      { name: 'Collateral Ratio', value: '100%' },
      { name: 'Total USDC Holdings', value: formatAmount(totalUSDCReserves, 2) },
    ],
    [totalSupply, totalUSDCReserves]
  )

  return (
    <Container>
      <Hero>
        <Image src={DEI_LOGO} height={'105px'} width={'120px'} alt="DEI logo" />
        <StatsHeader items={items} />
      </Hero>
      <Wrapper>
        {account && <DeiBondStats />}
        <CardWrapper>
          <Card href="/mint" title={'Mint DEI'} subTitle="Mint DEI" MainIcon={MINT_LOGO} HoverIcon={MINT_HOVER_LOGO} />
          <Card
            href="/redemption"
            title={'Redeem DEI'}
            subTitle="Redeem DEI"
            MainIcon={REDEEM_LOGO}
            HoverIcon={REDEEM_HOVER_LOGO}
          />
          <Card
            href="/bdei"
            title={'DEI Bonds'}
            subTitle="Redeem your DEI Bonds"
            MainIcon={BOND_LOGO}
            HoverIcon={BOND_HOVER_LOGO}
          />
          <Card
            href="/vest"
            title={'veDEUS'}
            subTitle="Lock your DEUS and earn rewards"
            MainIcon={VEDEUS_LOGO}
            HoverIcon={VEDEUS_HOVER_LOGO}
          />
          <Card
            href=""
            title={'Analytics'}
            // subTitle="DEI and DEUS Stats"
            subTitle="Coming Soon..."
            MainIcon={ANALYTICS_LOGO}
            HoverIcon={ANALYTICS_HOVER_LOGO}
          />
          <SocialCard />
        </CardWrapper>
        <Stats />
      </Wrapper>
    </Container>
  )
}
