import styled from 'styled-components'
import { useRouter } from 'next/router'

import Hero from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'

import Tableau from 'components/App/StableCoin/Tableau'
import { InputField, InputWrapper } from 'components/Input'
import { useState } from 'react'
import { PlusSquare } from 'react-feather'

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

export default function PoolAddress() {
  const router = useRouter()
  const { address } = router.query
  const lendingAddress = Number(address)

  // Assets
  const [fraxlendPairCoreAssets, setFraxlendPairCoreAssets] = useState()
  const [assetToken, setAssetToken] = useState<string>('')
  const [assetsTokens, setAssetsTokens] = useState<string[]>([])
  const [assetOracle, setAssetOracle] = useState<string>('')
  const [assetsOracles, setAssetsOracles] = useState<string[]>([])

  // Collaterals
  const [fraxlendPairCoreCollaterals, setFraxlendPairCoreCollaterals] = useState()
  const [collteralToken, setCollteralToken] = useState<string>('')
  const [collateralsTokens, setCollateralsTokens] = useState<string[]>([])
  const [collteralOracle, setCollteralOracle] = useState<string>('')
  const [ccollateralsOracles, setCollateralsOracles] = useState<string[]>([])
  const [collteralLtv, setCollteralLtv] = useState<number>(0)
  const [ltvs, setLtvs] = useState<number[]>([])

  console.log({ lendingAddress })
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
              onBlur={(event: any) => setFraxlendPairCoreAssets(event.target.value)}
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
            <PlusSquare onClick={() => setAssetsTokens([...assetsTokens, assetToken])} color={'white'} />
          </InputWrapper>
          <div>
            {assetsTokens.map((token, index) => (
              <div key={token}>
                {index + 1}-{token}
              </div>
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
            <PlusSquare onClick={() => setAssetsOracles([...assetsOracles, assetOracle])} color={'white'} />
          </InputWrapper>
          <div>
            {assetsOracles.map((oracle, index) => (
              <div key={oracle}>
                {index + 1}-{oracle}
              </div>
            ))}
          </div>
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
              onBlur={(event: any) => setCollteralToken(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare onClick={() => setCollateralsTokens([...collateralsTokens, collteralToken])} color={'white'} />
          </InputWrapper>
          <div>
            {collateralsTokens.map((token, index) => (
              <div key={token}>
                {index + 1}-{token}
              </div>
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
              onBlur={(event: any) => setCollteralOracle(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare
              onClick={() => setCollateralsOracles([...ccollateralsOracles, collteralOracle])}
              color={'white'}
            />
          </InputWrapper>
          <div>
            {ccollateralsOracles.map((oracle, index) => (
              <div key={oracle}>
                {index + 1}-{oracle}
              </div>
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
              onBlur={(event: any) => setCollteralLtv(event.target.value)}
              style={{ marginLeft: '15px', fontSize: '16px' }}
            />
            <PlusSquare onClick={() => setLtvs([...ltvs, collteralLtv])} color={'white'} />
          </InputWrapper>
          <div>
            {ltvs.map((ltv, index) => (
              <div key={ltv}>
                {index + 1}-{ltv}
              </div>
            ))}
          </div>
        </LendingItem>
      </TopWrapper>

      <Disclaimer />
    </Container>
  )
}
