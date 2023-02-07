import React from 'react'
import styled from 'styled-components'

import { Container } from 'components/App/StableCoin'
import { RowCenter } from 'components/Row'
import Stats from 'components/App/Dashboard/Stats'
import MigrationNav from 'components/App/Dashboard/MigrationNav'
import Account from 'components/App/Dashboard/Account'
import { useWeb3NavbarOption } from 'state/web3navbar/hooks'

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

export default function Dashboard() {
  useWeb3NavbarOption({ network: true, wallet: true, reward: true })

  return (
    <Container>
      <Wrapper>
        <MigrationNav />
        <Account />
        <Stats />
      </Wrapper>
    </Container>
  )
}
