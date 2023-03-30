import styled from 'styled-components'

export const HStack = styled.div`
  display: flex;
  align-items: center;
`
export const VStack = styled.div`
  display: flex;
  flex-direction: column;
`

interface IDivider {
  backgroundColor: string
}
export const Divider = styled.div<IDivider>`
  height: 2px;
  width: 100%;
  background-color: ${({ backgroundColor }) => backgroundColor};
`
export const TableHeader = styled(HStack)`
  font-size: 1rem;
  color: ${({ theme }) => theme.text1};
  justify-content: space-between;
  & > p:first-of-type {
    font-weight: medium;
    background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  & > p {
    color: ${({ theme }) => theme.text1};
  }
`

export const ContentTable = styled(HStack)`
  justify-content: space-between;
  margin-top: 16px;
`
export const Label = styled.p`
  display: flex;
  color: #8f939c;
  font-size: 0.875rem;
  align-items: center;
  & > p {
    margin-left: 4px;
  }
`
export const Value = styled.p`
  font-size: 0.875rem;
  font-weight: medium;
  color: ${({ theme }) => theme.text1};
`
