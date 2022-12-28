import React from 'react'
import styled from 'styled-components'

const StyledContainer = styled.div`
  margin-inline: auto !important;
  margin-top: 12px;
  display: block;
  width: calc(100% - 24px);
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left: 20px !important;
    margin-right: 10px !important;
    width: auto;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 340px;
  `}
`

const Container = ({ children }: { children: React.ReactChild }) => {
  return <StyledContainer>{children}</StyledContainer>
}

export default Container
