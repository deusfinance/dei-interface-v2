import styled from 'styled-components'

export const TabWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  font-size: 0.9rem;
`

export const TabButton = styled.div<{
  active: boolean
}>`
  padding: 5px;
  padding-bottom: 15px;
  border-bottom: 2px solid ${({ active, theme }) => (active ? theme.border1 : 'transparent')};
  font-weight: bold;
  &:hover {
    cursor: pointer;
  }
`
