import React from 'react'
import styled from 'styled-components'

const StyledContainer = styled.div`
  margin: 0 auto;
  margin-top: 12px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 340px;
    `}
  display: block;
  width: 100%;
`

const Container = ({ children }: { children: React.ReactChild }) => {
  return <StyledContainer>{children}</StyledContainer>
}

export default Container
