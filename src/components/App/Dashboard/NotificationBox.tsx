import styled from 'styled-components'
import Link from 'next/link'

import { ExternalLink } from 'components/Link'
import { PrimaryButton } from 'components/Button'
import { Row, RowBetween } from 'components/Row'
import Column from 'components/Column'

const NotificationBoxContainer = styled(RowBetween)`
  padding: 20px;
  border-radius: 12px;
  padding: 2px;
  background-image: linear-gradient(90deg, #359ecc 0%, #31b0a9 93.4%);
`
const NotificationBoxWrapper = styled(RowBetween)`
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg1};
`
const NotificationBoxHeaderContainer = styled(Row)``

const NotificationBoxHeader = styled(Row)`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
`
const NotificationBoxLink = styled(ExternalLink)`
  display: flex;
  margin-top: 14px;
  color: ${({ theme }) => theme.bg6};
  font-size: 1rem;
  width: fit-content;
  & > div {
    margin-left: 8px;
  }
  &:hover {
    color: ${({ theme }) => theme.bg6};
    text-decoration: underline;
  }
`

const ButtonText = styled.span`
  display: flex;
  font-family: 'Inter';
  font-weight: 700;
  font-size: 14px;
  height: 100%;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}
  &>p {
    background: -webkit-linear-gradient(90deg, #0badf4 0%, #30efe4 93.4%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`
const GradientButton = styled(PrimaryButton)`
  padding: 2px;
  width: fit-content;
  min-width: 200px;
  border-radius: 12px;
  display: flex;
  justify-content: flex-end;
`

const NotificationBox = ({
  source,
  destination,
  migrationLink,
}: {
  source: string
  destination: string
  migrationLink: string
}) => {
  return (
    <NotificationBoxContainer>
      <NotificationBoxWrapper>
        <NotificationBoxHeaderContainer>
          <Column>
            <NotificationBoxHeader>
              <p>You still have some old {source}</p>
            </NotificationBoxHeader>
            <NotificationBoxLink>{`Migrate them to ${destination}, don't get left behind!`}</NotificationBoxLink>
          </Column>
        </NotificationBoxHeaderContainer>
        <Column href={migrationLink} as={migrationLink.startsWith('/') ? Link : ExternalLink}>
          <GradientButton>
            <ButtonText>
              <p style={{ padding: '16px 32px' }}>Migrate to {destination}</p>
            </ButtonText>
          </GradientButton>
        </Column>
      </NotificationBoxWrapper>
    </NotificationBoxContainer>
  )
}

export default NotificationBox
