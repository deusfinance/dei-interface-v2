import React from 'react'
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

import Hero, { HeroSubtext } from 'components/Hero'
import StatsHeader from 'components/StatsHeader'
import { BottomWrapper, Container, InputWrapper, Title, MainButton } from 'components/App/StableCoin'
import { RowCenter } from 'components/Row'
import { DashboardCard } from 'components/App/Dashboard/card'

export default function Dashboard() {
  const items = [
    { name: 'DEI Price', value: '$0.5' },
    { name: 'DEI Total Supply', value: '0.77m' },
    { name: 'Collateral Ratio', value: '72.53m' },
    { name: 'Total USDC Holdings', value: '72.53m' },
  ]

  const Wrapper = styled(RowCenter)`
    max-width: 1300px;
    margin-top: 28px;
    gap: 20px;
    flex-wrap: wrap;
    /* background: ${({ theme }) => theme.bg0}; */
    border-radius: 15px;
    width: 100%;
    overflow: hidden;
  `

  return (
    <Container>
      <Hero>
        <Image src={DEI_LOGO} height={'120px'} width={'140px'} alt="DEI logo" />
        <StatsHeader items={items} />
      </Hero>
      <Wrapper>
        <DashboardCard
          href="/mint"
          title={'Mint DEI'}
          subTitle="Mint DEI"
          MainIcon={MINT_LOGO}
          HoverIcon={MINT_HOVER_LOGO}
        />
        <DashboardCard
          href="/mint"
          title={'Redeem DEI'}
          subTitle="Redeem DEI"
          MainIcon={REDEEM_LOGO}
          HoverIcon={REDEEM_HOVER_LOGO}
        />
        <DashboardCard
          href="/mint"
          title={'DEI Bonds'}
          subTitle="Redeem your DEI Bonds"
          MainIcon={BOND_LOGO}
          HoverIcon={BOND_HOVER_LOGO}
        />
        <DashboardCard
          href="/mint"
          title={'veDEUS'}
          subTitle="Lock your deus and earn rewards"
          MainIcon={VEDEUS_LOGO}
          HoverIcon={VEDEUS_HOVER_LOGO}
        />
        <DashboardCard
          href="/mint"
          title={'Analytics'}
          subTitle="DEI and DEUS Stats"
          MainIcon={ANALYTICS_LOGO}
          HoverIcon={ANALYTICS_HOVER_LOGO}
        />
        <DashboardCard
          href="/mint"
          title={'Redeem DEI'}
          subTitle="Redeem DEI"
          MainIcon={REDEEM_LOGO}
          HoverIcon={REDEEM_HOVER_LOGO}
        />
      </Wrapper>
    </Container>
  )
}
