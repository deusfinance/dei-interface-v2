import React, { useMemo } from 'react'
import styled from 'styled-components'

import { useWeb3NavbarOption } from 'state/web3navbar/hooks'
import { useOwnerBondNFTs, useOwnerVDeusNFT, useOwnerVeDeusNFTs } from 'hooks/useOwnerNfts'

import { Container } from 'components/App/StableCoin'
import { RowCenter } from 'components/Row'
import Stats from 'components/App/Dashboard/Stats'
import NotificationBox from 'components/App/Dashboard/NotificationBox'
import Account from 'components/App/Dashboard/Account'
import Staking from 'components/App/Dashboard/Staking'
import { getUserStakingPools } from 'hooks/useStakingInfo'

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
  const { results: userVDeusNFTs } = useOwnerVDeusNFT()
  const { results: userVeDeusNFTs } = useOwnerVeDeusNFTs()
  const { results: userBDeiBondNFTs } = useOwnerBondNFTs()

  useWeb3NavbarOption({ network: true, wallet: true, reward: true })
  //const threshold = 2
  //const [results] = useState(() => Stakings.slice(0, Stakings.length > 2 ? threshold : Stakings.length))

  const results = getUserStakingPools()

  const { userHasVDeusNFTs, userHasVeDeusNFTs, userHasBDeiBondNFTs } = useMemo(() => {
    return {
      userHasVDeusNFTs: userVDeusNFTs && userVDeusNFTs.length > 0,
      userHasVeDeusNFTs: userVeDeusNFTs && userVeDeusNFTs.length > 0,
      userHasBDeiBondNFTs: userBDeiBondNFTs && userBDeiBondNFTs.length > 0,
    }
  }, [userBDeiBondNFTs, userVDeusNFTs, userVeDeusNFTs])

  return (
    <Container>
      <Wrapper>
        {userHasVDeusNFTs && (
          <NotificationBox
            source="vDEUS NFT"
            destination="xDEUS"
            readMore=""
            migrationLink="https://legacy.dei.finance/vdeus/new"
          />
        )}
        {userHasVeDeusNFTs && (
          <NotificationBox
            source="veDEUS"
            destination="xDEUS"
            readMore=""
            migrationLink="https://app.deus.finance/vest"
          />
        )}
        {userHasBDeiBondNFTs && (
          <NotificationBox
            source="DEI Bond NFT"
            destination="DEI"
            readMore=""
            migrationLink="https://app.dei.finance/bond"
          />
        )}
        <Account />
        {results.length !== 0 && <Staking stakings={results} />}
        <Stats />
      </Wrapper>
    </Container>
  )
}
