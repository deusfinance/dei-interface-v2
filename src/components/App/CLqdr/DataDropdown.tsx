import styled from 'styled-components'

import CLQDR_LOGO from '/public/static/images/tokens/clqdr.svg'

import { ItemWrapper, Item } from '.'
import Dropdown from 'components/App/CLqdr/Dropdown'
import { ExternalLink } from 'components/Link'

const CLQDR = styled.span`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  text-decoration-line: underline;
  background: ${({ theme }) => theme.lqdrColor};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  align-self: flex-start;
`

const LQDRText = styled.p`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  width: 100%;
  align-self: flex-start;
`

const ClqdrItem = styled(Item)`
  height: unset;
  flex-direction: column;
  gap: 12px;
  &:hover {
    background: ${({ theme }) => theme.bg1};
  }
`

function getCLqdrData(): JSX.Element {
  return (
    <ItemWrapper>
      <ClqdrItem>
        <LQDRText>
          Liquid Driver and DEUS have a long-standing partnership and cLQDR holders had a DAO vote to allow DEUS to{' '}
          <ExternalLink
            href="https://medium.com/@deusfinance/deus-finance-taking-over-clqdr-stewardship-71e93db6ceae"
            style={{ textDecoration: 'underline' }}
          >
            take over the stewardship.
          </ExternalLink>
        </LQDRText>
        <LQDRText>
          cLQDR is a wrapped version of xLQDR. xLQDR is the vested version of $LQDR and receives rewards from the LQDR
          revenue-sharing vault.
        </LQDRText>
        <CLQDR>cLQDR benefits:</CLQDR>
        <LQDRText>
          1. Compounds all the rewards (cLQDR increases vs. LQDR overtime). This increases long-term returns and makes
          cLQDR easier to integrate with borrow markets, LPs, and other protocols. This also simplifies holding because
          users {`don't `}need to claim rewards, since rewards are automatically compounded into the {`holder's `}
          position.
        </LQDRText>
        <LQDRText>2. Allows users to sell their position in secondary markets.</LQDRText>
        <LQDRText>
          3. Holders profit from the rewards and the bribes that xLQDR holders receive, and also from the performance
          fees collected through strategies.
        </LQDRText>
        <LQDRText>
          4. Creates constant buy pressure for LQDR and perpetually locks a large portion of {`LQDR's `}supply.
        </LQDRText>
      </ClqdrItem>
    </ItemWrapper>
  )
}

export default function DataDropdown() {
  return <Dropdown content={getCLqdrData()} logo={CLQDR_LOGO} text={'What is cLQDR?'} />
}
