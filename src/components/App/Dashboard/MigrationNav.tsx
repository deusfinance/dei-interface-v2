import { ExternalLink } from 'components/Link'
import styled from 'styled-components'
import { PrimaryButton } from 'components/Button'
import { Row, RowBetween } from 'components/Row'
import Column from 'components/Column'
import ImageWithFallback from 'components/ImageWithFallback'
import ExternalLinkIcon from '/public/static/images/pages/stake/down.svg'
// import MigrationHeaderIcon from '/public/static/images/pages/dashboard/migration-header.svg'

const MigrationContainer = styled(RowBetween)`
  padding: 20px;
  border-radius: 12px;
  padding: 2px;
  background-image: linear-gradient(90deg, rgba(224, 151, 76, 0.52) 0%, rgba(201, 63, 111, 0.52) 100%);
`
const MigrationWrapper = styled(RowBetween)`
  padding: 20px 25px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg3};
`
const MigrationHeaderContainer = styled(Row)``

const MigrationHeader = styled(Row)`
  font-size: 1rem;
  font-weight: 600;
  & > p:first-of-type {
    color: ${({ theme }) => theme.text1};
  }
  & > p:last-of-type {
    background-image: linear-gradient(to right, #0badf4, #30efe4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-left: 1ch;
  }
`
const MigrationLink = styled(ExternalLink)`
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
const MigrationHeaderImage = styled.div`
  transform: translateY(20px);
`
const ButtonText = styled.span`
  display: flex;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 15px;
  height: 100%;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  align-items: center;
  border-radius: 12px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px;
  `}
  &>p {
    background: -webkit-linear-gradient(0deg, #eea85f 0%, #ef3677 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`
const GradientButton = styled(PrimaryButton)`
  padding: 2px;
  width: fit-content;
  border-radius: 12px;
`

const MigrationNav = () => {
  return (
    <MigrationContainer>
      <MigrationWrapper>
        <MigrationHeaderContainer>
          <Column>
            <MigrationHeader>
              <p>Migrate form vDEUS NFT to </p>
              <p>vDEUS ERC20</p>
            </MigrationHeader>
            <MigrationLink href="/">
              read more about vDEUS ERC20 <ImageWithFallback alt="arrow" width={8} height={8} src={ExternalLinkIcon} />
            </MigrationLink>
          </Column>
          <MigrationHeaderImage>
            {/* <ImageWithFallback src={MigrationHeaderIcon} alt="migration" height={68} width={120} /> */}
          </MigrationHeaderImage>
        </MigrationHeaderContainer>
        <GradientButton>
          <ButtonText>
            <p style={{ padding: '18px 23px' }}>Migrate to vDEUS ERC20</p>
          </ButtonText>
        </GradientButton>
      </MigrationWrapper>
    </MigrationContainer>
  )
}

export default MigrationNav
