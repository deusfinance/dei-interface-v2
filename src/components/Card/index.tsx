import styled from 'styled-components'

export const Card = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: hidden;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 2px;
  padding: 2rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `}
`
