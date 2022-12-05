import Image from 'next/image'
import styled from 'styled-components'

const ReadingContainer = styled.div`
  margin: 0 auto;
  margin-top: 12px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 340px;
    `}
  display: block;
  width: 100%;
`
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

const Reading = () => {
  return (
    <ReadingContainer>
      <ReadingContent>
        <ReadingHeader>
          <p>DEUS-vDEUS Stacking</p>
          <a href="#">
            <p>Read more</p>
            <Icon width="8px" height="8px" src="/static/images/pages/stake/down.svg" />
          </a>
        </ReadingHeader>
        <p style={{ marginTop: 6 }}>. . . </p>
      </ReadingContent>
    </ReadingContainer>
  )
}

export default Reading
