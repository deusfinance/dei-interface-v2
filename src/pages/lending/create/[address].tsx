import styled from 'styled-components'
// import { useRouter } from 'next/router'

import Hero from 'components/Hero'
import ImageWithFallback from 'components/ImageWithFallback'
import STAKE_ICON from '/public/static/images/pages/bond/DEI_logo.svg'
import MINT_IMG from '/public/static/images/pages/mint/TableauBackground.svg'

import Tableau from 'components/App/StableCoin/Tableau'
import { InputField, InputWrapper } from 'components/Input'
import { useCallback, useState } from 'react'
import { PlusSquare } from 'react-feather'
import { ConnectWallet, MainButton } from 'components/App/StableCoin'
import useWeb3React from 'hooks/useWeb3'
import { DotFlashing } from 'components/Icons'
import { useAssetsCallback, useCollateralsCallback } from 'hooks/useLendingCallback'
import { useDeployerLendings } from 'hooks/useLendingPage'
import { RowCenter } from 'components/Row'

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

const Text = styled(RowCenter)`
  font-weight: 500;
  font-size: 14px;
  margin-top: 16px;
  color: ${({ theme }) => theme.text2};
`

const TextBright = styled.span`
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  margin-left: 8px;
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
  // const router = useRouter()
  // const { addressCount } = router.query

  const address = useDeployerLendings()
  // console.log({ address })

  // Assets
  const [fraxlendPairCoreAssets, setFraxlendPairCoreAssets] = useState('')
  const [assetToken, setAssetToken] = useState<string>('')
  const [assetsTokens, setAssetsTokens] = useState<string[]>([])
  const [assetOracle, setAssetOracle] = useState<string>('')
  const [assetsOracles, setAssetsOracles] = useState<string[]>([])

  // Collaterals
  const [fraxlendPairCoreCollaterals, setFraxlendPairCoreCollaterals] = useState('')
  const [collateralToken, setCollateralToken] = useState<string>('')
  const [collateralsTokens, setCollateralsTokens] = useState<string[]>([])
  const [collateralOracle, setCollateralOracle] = useState<string>('')
  const [collateralsOracles, setCollateralsOracles] = useState<string[]>([])
  const [collateralLtv, setCollateralLtv] = useState<number>(0)
  const [ltvs, setLtvs] = useState<number[]>([])

  const [awaitingAssetsConfirmation, setAwaitingAssetsConfirmation] = useState(false)
  const [awaitingCollateralsConfirmation, setAwaitingCollateralsConfirmation] = useState(false)

  const {
    state: AssetsCallbackState,
    callback: AssetsCallback,
    error: AssetsCallbackError,
  } = useAssetsCallback(fraxlendPairCoreAssets, assetsTokens, assetsOracles)

  const handleAddAssets = useCallback(async () => {
    console.log('called handleCrateLending')
    console.log(AssetsCallbackState, AssetsCallbackError)
    if (!AssetsCallback) return
    try {
      setAwaitingAssetsConfirmation(true)
      const txHash = await AssetsCallback()
      setAwaitingAssetsConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingAssetsConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [AssetsCallback, AssetsCallbackError, AssetsCallbackState])

  const {
    state: CollateralsCallbackState,
    callback: CollateralsCallback,
    error: CollateralsCallbackError,
  } = useCollateralsCallback(fraxlendPairCoreCollaterals, collateralsTokens, collateralsOracles, ltvs)

  const handleAddCollaterals = useCallback(async () => {
    console.log('called handleCrateLending')
    console.log(CollateralsCallbackState, CollateralsCallbackError)
    if (!CollateralsCallback) return
    try {
      setAwaitingCollateralsConfirmation(true)
      const txHash = await CollateralsCallback()
      setAwaitingCollateralsConfirmation(false)
      console.log({ txHash })
    } catch (e) {
      setAwaitingCollateralsConfirmation(false)
      if (e instanceof Error) {
        console.error(e)
      } else {
        console.error(e)
      }
    }
  }, [CollateralsCallback, CollateralsCallbackError, CollateralsCallbackState])

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

  function getAssetsActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    if (awaitingAssetsConfirmation) {
      return (
        <MainButton>
          Defining Assets <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleAddAssets()}>Define Assets</MainButton>
  }

  function getCollateralsActionButton(): JSX.Element | null {
    if (!chainId || !account) return <ConnectWallet />
    if (awaitingCollateralsConfirmation) {
      return (
        <MainButton>
          Defining Collaterals <DotFlashing />
        </MainButton>
      )
    }
    return <MainButton onClick={() => handleAddCollaterals()}>Define Collaterals</MainButton>
  }

  return (
    <Container>
      <Hero>
        <ImageWithFallback src={STAKE_ICON} width={224} height={133} alt={`Logo`} />
        {address && (
          <Text>
            The most recent deployed lending address is <TextBright>{address}</TextBright>
          </Text>
        )}
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
              defaultValue={fraxlendPairCoreAssets}
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
              style={{ cursor: 'pointer' }}
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
                if (assetOracle !== '') setAssetsOracles([...assetsOracles, assetOracle])
              }}
              color={'white'}
              style={{ cursor: 'pointer' }}
            />
          </InputWrapper>
          <div>
            {assetsOracles.map((oracle, index) => (
              <Item key={oracle} onClick={() => removeToken('asset', 'oracle', oracle)}>
                {index + 1}-{oracle}
              </Item>
            ))}
          </div>
          {getAssetsActionButton()}
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
              defaultValue={fraxlendPairCoreCollaterals}
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
              style={{ cursor: 'pointer' }}
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
              style={{ cursor: 'pointer' }}
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
                if (ltv !== 0) setLtvs([...ltvs, ltv])
              }}
              color={'white'}
              style={{ cursor: 'pointer' }}
            />
          </InputWrapper>
          <div>
            {ltvs.map((ltv, index) => (
              <Item key={ltv} onClick={() => removeToken('ltv', 'token', ltv)}>
                {index + 1}-{ltv}
              </Item>
            ))}
          </div>
          {getCollateralsActionButton()}
        </LendingItem>
      </TopWrapper>
    </Container>
  )
}
