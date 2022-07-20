import styled from 'styled-components'
import { Card } from 'components/Card'

export const Warning = styled.div`
  text-align: center;
  width: 100%;
  height: fit-content;
  padding: 10px;
  font-size: 0.6rem;
  border: 1px solid ${({ theme }) => theme.red1};
  box-shadow: 1px 1px ${({ theme }) => theme.red2};
`

export const Maintenance = styled(Card)`
  border: 1px solid ${({ theme }) => theme.warning};
  margin-bottom: 30px;
`
