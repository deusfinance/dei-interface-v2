import Image from 'next/image'
import styled from 'styled-components'
import Container from './common/Container'
import { ExternalLink } from 'components/Link'

const ReadingContent = styled.div`
  background-image: url('/static/images/pages/stake/staking-background.png');
  background-color: ${({ theme }) => theme.bg0};
  background-position: right;
  background-repeat: no-repeat;
  padding: 15px;
  border-radius: 12px;
`
const ReadingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  & > a {
    display: flex;
    color: ${({ theme }) => theme.text2};
    text-decoration: none;
    align-items: center;
    &:hover {
      text-decoration: underline;
    }
    & > p {
      margin-right: 8px !important;
    }
  }
`
const Icon = styled(Image)``

export const PoolDetails = () => {
  return (
    <Container>
      <ReadingContent>
        <ReadingHeader>
          <p>DEUS-xDEUS Staking</p>
          <ExternalLink href="https://google.com">
            <p>Read more</p>
            <Icon width="8px" height="8px" src="/static/images/pages/stake/down.svg" />
          </ExternalLink>
        </ReadingHeader>
        <p style={{ marginTop: 6 }}>. . . </p>
      </ReadingContent>
    </Container>
  )
}

export default PoolDetails
