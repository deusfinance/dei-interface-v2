import styled from 'styled-components'

export const DualImageWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;

  & > * {
    &:first-child {
      transform: translateX(10%);
    }
    &:nth-child(2) {
      transform: translateX(-10%);
    }
  }
`
