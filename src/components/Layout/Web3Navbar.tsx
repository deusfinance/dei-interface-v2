import { RowBetween } from 'components/Row'
import React, { useEffect, useState } from 'react'
import { useGetWeb3NavbarOption } from 'state/web3navbar/hooks'
import { TNAVBAR_OPTIONS } from 'state/web3navbar/types'
import styled from 'styled-components'
import StatsHeader from 'components/StatsHeader'
import { useRouter } from 'next/router'
import Menu from './Menu'
import Web3Status from '../Web3Status/index'
import Web3Network from 'components/Web3Network'
import { HStack } from 'components/App/Staking/common/Layout'
import DeusClaimBar from 'components/DeusClaimBar'

const Wrapper = styled(RowBetween)<{ rtl: boolean }>`
  height: 60px;
  background: ${({ theme }) => theme.bg0};
  padding: 13px 28px;
  flex-direction: ${({ rtl }) => (rtl ? 'row-reverse' : 'row')};
`
const Separator = styled.div`
  width: 100%;
  height: 2px;
  background: ${({ theme }) => theme.bg3};
`
const StatsHeaderWrapper = styled.div`
  & > div > div > div > div {
    background: ${({ theme }) => theme.bg2};
    border: none;
  }
`
const MenuWrapper = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToLarge`
  display:inline-block;
`};
`
const ComponentWrapper = styled(HStack)`
  &:first-of-type {
    column-gap: 48px;
  }
  &:last-of-type {
    column-gap: 12px;
  }
`
const AprTvlWrapper = styled(HStack)`
  & > p {
    font-size: 1rem;
    font-weight: bold;
  }
  & > p:first-of-type {
    color: ${({ theme }) => theme.text2};
  }
  & > p:last-of-type {
    margin-left: 12px;
    color: ${({ theme }) => theme.text1};
  }
`
type TPartialNavbar = Partial<TNAVBAR_OPTIONS>
type TComponentKey = {
  left: (keyof TPartialNavbar)[]
  right: (keyof TPartialNavbar)[]
}
const componentKey: TComponentKey = {
  left: ['stake', 'apr', 'tvl'],
  right: ['reward', 'network', 'wallet'],
}

const Web3Navbar = () => {
  const options: TPartialNavbar = useGetWeb3NavbarOption()

  const [components, setComponents] = useState<TComponentKey>({
    left: [],
    right: [],
  })
  useEffect(() => {
    Object.entries(componentKey).forEach(([key, value]) => {
      value.forEach((name) => {
        const isExist = components[key as keyof TComponentKey].find((item) => item === name)
        if (options[name] && !isExist) {
          setComponents((prev) => ({ ...prev, [key]: [...prev[key as keyof TComponentKey], name] }))
        }
      })
    })
  }, [options])

  const router = useRouter()
  function onSelect(pid: number) {
    router.push(`/stake/manage/${pid}`)
  }
  const pid = router.query.pid || undefined

  return (
    <>
      <Wrapper rtl={components.left.length === 0}>
        {components.left.length !== 0 && (
          <ComponentWrapper>
            {components.left.map((componentName) => {
              if (componentName === componentKey['left'][0] && pid) {
                return (
                  <StatsHeaderWrapper>
                    <StatsHeader pid={+pid} onSelectDropDown={onSelect} />
                  </StatsHeaderWrapper>
                )
              }
              if (componentName === componentKey['left'][1]) {
                return (
                  <AprTvlWrapper>
                    <p>APR:</p>
                    <p>25%</p>
                  </AprTvlWrapper>
                )
              }
              if (componentName === componentKey['left'][2]) {
                return (
                  <AprTvlWrapper>
                    <p>TVL:</p>
                    <p>$4,394,883</p>
                  </AprTvlWrapper>
                )
              }
            })}
          </ComponentWrapper>
        )}
        <ComponentWrapper>
          {components.right.map((componentName) => {
            if (componentName === componentKey['right'][0]) {
              return <DeusClaimBar />
            }
            if (componentName === componentKey['right'][1]) {
              return <Web3Network />
            }
            if (componentName === componentKey['right'][2]) {
              return <Web3Status />
            }
          })}
          <MenuWrapper>
            <Menu />
          </MenuWrapper>
        </ComponentWrapper>
      </Wrapper>
      <Separator />
    </>
  )
}

const Memoized = React.memo(Web3Navbar)

export default Memoized
