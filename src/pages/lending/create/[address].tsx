import styled from 'styled-components'
import { useRouter } from 'next/router'

import Hero from 'components/Hero'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'

import Tableau from 'components/App/StableCoin/Tableau'
import { InputField, InputWrapper } from 'components/Input'
import { useState } from 'react'
import { PlusSquare } from 'react-feather'
import { ConnectWallet, MainButton } from 'components/App/StableCoin'
import useWeb3React from 'hooks/useWeb3'

export const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const TopWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin: auto;
  background: ${({ theme }) => theme.bg2};
  padding: 25px 30px;
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: 8px;

  & > * {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 460px;
    flex-direction: column;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    min-width: 340px;
  `}
`

const LendingItem = styled.div`
  /* margin: 15px; */
  margin: 0px 30px;
  & > * {
    margin-top: 10px;
    margin-bottom: 10px;
  }
`

const Item = styled.div`
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 4px;
  margin: 10px auto;
  padding: 10px;
`

export default function PoolAddress() {
  const { chainId, account } = useWeb3React()
  const router = useRouter()
  const { address } = router.query

  console.log({ address })

  // Assets
  const [fraxlendPairCoreAssets, setFraxlendPairCoreAssets] = useState()
  const [assetToken, setAssetToken] = useState<string>('')
  const [assetsTokens, setAssetsTokens] = useState<string[]>([])
  const [assetOracle, setAssetOracle] = useState<string>('')
  const [assetsOracles, setAssetsOracles] = useState<string[]>([])

  // Collaterals
  const [fraxlendPairCoreCollaterals, setFraxlendPairCoreCollaterals] = useState()
  const [collateralToken, setCollateralToken] = useState<string>('')
  const [collateralsTokens, setCollateralsTokens] = useState<string[]>([])
  const [collateralOracle, setCollateralOracle] = useState<string>('')
  const [collateralsOracles, setCollateralsOracles] = useState<string[]>([])
  const [collateralLtv, setCollateralLtv] = useState<number>(0)
  const [ltvs, setLtvs] = useState<number[]>([])

  function removeToken(assetOrCollateral: string, type: string, address: string | number) {
    let filteredArray
    if (assetOrCollateral === 'asset') {
      if (type === 'token') {
        filteredArray = assetsTokens.filter((token) => token !== address)
        setAssetsTokens(filteredArray)
      } else {
        filteredArray = assetsOracles.filter((oracle) => oracle !== address)
        setAssetsOracles(filteredArray)
      }
    } else {
      if (type === 'token') {
        filteredArray = collateralsTokens.filter((token) => token !== address)
        setCollateralsTokens(filteredArray)
      } else {
        filteredArray = collateralsOracles.filter((token) => token !== address)
        setCollateralsOracles(filteredArray)
      }
    }
    if (assetOrCollateral === 'ltv') {
      filteredArray = ltvs.filter((token) => token !== address)
      setLtvs(filteredArray)
    }
  }

  function getActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    // if (awaitingLendingConfirmation) {
    //   return (
    //     <MainButton>
    //       Creating {name} pool <DotFlashing />
    //     </MainButton>
    //   )
    // }
    return <MainButton onClick={() => console.log('')}>Define</MainButton>
  }
  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
      </Hero>

      <TopWrapper>
        <LendingItem>
          <Tableau title={'Define Assets'} imgSrc={MINT_IMG} />

          <InputWrapper>
            <div>Fraxlend Pair Core:</div>
            <InputField
              title="fraxlendPairCore"
              autoFocus
              type="text"
              placeholder=""
              spellCheck="false"
              onBlur={(event: any) => (event.target.value !== '' ? setFraxlendPairCoreAssets(event.target.value) : '')}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
          </InputWrapper>

          <InputWrapper>
            <div>Tokens:</div>
            <InputField
              title="Tokens"
              autoFocus
              type="text"
              placeholder=""
              spellCheck="false"
              onBlur={(event: any) => setAssetToken(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare
              onClick={() => {
                if (assetToken !== '') setAssetsTokens([...assetsTokens, assetToken])
              }}
              color={'white'}
            />
          </InputWrapper>
          <div>
            {assetsTokens.map((token, index) => (
              <Item key={token} onClick={() => removeToken('asset', 'token', token)}>
                {index + 1}-{token}
              </Item>
            ))}
          </div>

          <InputWrapper>
            <div>Oracles:</div>
            <InputField
              title="Oracles"
              autoFocus
              type="text"
              placeholder=""
              spellCheck="false"
              onBlur={(event: any) => setAssetOracle(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare
              onClick={() => {
                if (assetToken !== '') setAssetsOracles([...assetsOracles, assetOracle])
              }}
              color={'white'}
            />
          </InputWrapper>
          <div>
            {assetsOracles.map((oracle, index) => (
              <Item key={oracle} onClick={() => removeToken('asset', 'oracle', oracle)}>
                {index + 1}-{oracle}
              </Item>
            ))}
          </div>
          {getActionButton()}
        </LendingItem>
        <LendingItem>
          <Tableau title={'Define Collaterals'} imgSrc={MINT_IMG} />

          <InputWrapper>
            <div>Fraxlend Pair Core:</div>
            <InputField
              title="fraxlendPairCore"
              autoFocus
              type="text"
              placeholder=""
              spellCheck="false"
              onBlur={(event: any) => setFraxlendPairCoreCollaterals(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
          </InputWrapper>

          <InputWrapper>
            <div>Tokens:</div>
            <InputField
              title="Tokens"
              autoFocus
              type="text"
              placeholder=""
              spellCheck="false"
              onBlur={(event: any) => setCollateralToken(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare
              onClick={() => {
                if (collateralToken !== '') setCollateralsTokens([...collateralsTokens, collateralToken])
              }}
              color={'white'}
            />
          </InputWrapper>
          <div>
            {collateralsTokens.map((token, index) => (
              <Item key={token} onClick={() => removeToken('collateral', 'token', token)}>
                {index + 1}-{token}
              </Item>
            ))}
          </div>

          <InputWrapper>
            <div>Oracles:</div>
            <InputField
              title="Oracles"
              autoFocus
              type="text"
              placeholder=""
              spellCheck="false"
              onBlur={(event: any) => setCollateralOracle(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare
              onClick={() => {
                if (collateralOracle !== '') setCollateralsOracles([...collateralsOracles, collateralOracle])
              }}
              color={'white'}
            />
          </InputWrapper>
          <div>
            {collateralsOracles.map((oracle, index) => (
              <Item key={oracle} onClick={() => removeToken('collateral', 'oracle', oracle)}>
                {index + 1}-{oracle}
              </Item>
            ))}
          </div>

          <InputWrapper>
            <div>Ltvs:</div>
            <InputField
              title="ltvs"
              autoFocus
              type="text"
              placeholder=""
              spellCheck="false"
              onBlur={(event: any) => setCollateralLtv(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare
              onClick={() => {
                const ltv = Number(collateralLtv)
                console.log({ ltv })
                if (ltv !== 0) setLtvs([...ltvs, ltv])
              }}
              color={'white'}
            />
          </InputWrapper>
          <div>
            {ltvs.map((ltv, index) => (
              <Item key={ltv} onClick={() => removeToken('ltv', 'token', ltv)}>
                {index + 1}-{ltv}
              </Item>
            ))}
          </div>
          {getActionButton()}
        </LendingItem>
      </TopWrapper>
    </Container>
  )
}
