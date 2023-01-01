import { RowEnd } from 'components/Row'
import { useEffect } from 'react'
// import { useAppSelector } from 'state'
import { useGetWeb3NavbarOption } from 'state/web3navbar/hooks'
import { TNAVBAR_OPTIONS } from 'state/web3navbar/types'
import styled from 'styled-components'

const Wrapper = styled(RowEnd)`
  height: 60px;
  background: ${({ theme }) => theme.bg0};
  padding: 13px 28px;
`
const Separator = styled.div`
  width: 100%;
  height: 2px;
  background: ${({ theme }) => theme.bg3};
`
const Web3Navbar = () => {
  const options: Partial<TNAVBAR_OPTIONS> = useGetWeb3NavbarOption()
  useEffect(() => {
    console.log({ options })
  })
  return (
    <>
      <Wrapper></Wrapper>
      <Separator />
    </>
  )
}

export default Web3Navbar
