import styled from 'styled-components'

const Box = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border1};
  border-radius: 4px;
  padding: 20px;
  color: ${({ theme }) => theme.text2};
  overflow: hidden;
  white-space: nowrap;
`

export default Box
