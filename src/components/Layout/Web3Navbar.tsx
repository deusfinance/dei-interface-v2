import { RowBetween } from 'components/Row'
import React, { useEffect, useState } from 'react'
import { useGetWeb3NavbarOption } from 'state/web3navbar/hooks'
import { TNAVBAR_OPTIONS } from 'state/web3navbar/types'
import styled from 'styled-components'
import StatsHeader from 'components/StatsHeader'
import { useRouter } from 'next/router'
import Web3Status from '../Web3Status/index'
import Web3Network from 'components/Web3Network'
import { HStack } from 'components/App/Staking/common/Layout'
import DeusClaimBar from 'components/DeusClaimBar'
import { ChevronRight } from 'react-feather'
import { IconWrapper } from 'components/Icons'

const Wrapper = styled(RowBetween)`
  justify-content: flex-start;
  height: 60px;
  background: ${({ theme }) => theme.bg0};
  padding: 13px 28px;
`
const Separator = styled.div`
  width: 100%;
  height: 2px;
  background: ${({ theme }) => theme.bg3};
`
const StatsHeaderWrapper = styled.div`
  & > div > div > div > div {
    background: ${({ theme }) => theme.bg1};
    border: none;
  }
`

const ComponentWrapper = styled(HStack)`
  &:first-of-type {
    column-gap: 48px;
  }
  &:last-of-type {
    column-gap: 12px;
  }
`
const MenuOpenButton = styled.button`
  margin: 10px 28px 10px -30px;
  padding: 12px 0px;
  max-width: 25px;
  max-height: 40px;
  background: ${({ theme }) => theme.bg1};
  border-radius: 0px 8px 8px 0px;
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

const Web3Navbar = ({ toggleSideMenu, isOpen }: { toggleSideMenu: () => void; isOpen: boolean }) => {
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
      <Wrapper>
        {!isOpen && (
          <MenuOpenButton onClick={toggleSideMenu}>
            <IconWrapper>
              <ChevronRight color="#6F7074"></ChevronRight>
            </IconWrapper>
          </MenuOpenButton>
        )}
        {components.left.length !== 0 && (
          <ComponentWrapper>
            {components.left.map((componentName) => {
              if (componentName === componentKey['left'][0] && pid) {
                return (
                  <StatsHeaderWrapper key={componentKey['left'][0]}>
                    <StatsHeader pid={+pid} onSelectDropDown={onSelect} />
                  </StatsHeaderWrapper>
                )
              }
            })}
          </ComponentWrapper>
        )}
        <ComponentWrapper style={{ marginLeft: 'auto' }}>
          {components.right.map((componentName) => {
            if (componentName === componentKey['right'][0]) {
              return <DeusClaimBar key={componentKey['right'][0]} />
            }
            if (componentName === componentKey['right'][1]) {
              return <Web3Network key={componentKey['right'][1]} />
            }
            if (componentName === componentKey['right'][2]) {
              return <Web3Status key={componentKey['right'][2]} />
            }
          })}
        </ComponentWrapper>
      </Wrapper>
      <Separator />
    </>
  )
}

const Memoized = React.memo(Web3Navbar)

export default Memoized
