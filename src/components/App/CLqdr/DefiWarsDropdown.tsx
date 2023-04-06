import styled from 'styled-components'

import DEFIWAR_LOGO from '/public/static/images/pages/clqdr/defi_war.svg'

import { ExternalLink } from 'components/Link'
import { truncateAddress } from 'utils/address'
import Dropdown from 'components/App/CLqdr/Dropdown'
import { ItemWrapper, Item, ItemText, ItemValue } from '.'

const SolidValue = styled(ItemValue)`
  text-decoration-line: none;
`
const GreenItem = styled(ItemValue)`
  text-decoration-line: none;
  color: ${({ theme }) => theme.green1};
`

function getDefiWars(): JSX.Element {
  return (
    <ItemWrapper>
      <Item>
        <ItemText>Tokens:</ItemText>
        <ItemValue>
          <ExternalLink
            href={`https://ftmscan.com/token/0x814c66594a22404e101fecfecac1012d8d75c156`}
            style={{ textDecoration: 'underline' }}
          >
            {truncateAddress('0x814c66594a22404e101fecfecac1012d8d75c156')}
          </ExternalLink>
        </ItemValue>
      </Item>
      <Item>
        <ItemText>Expected Ratio:</ItemText>
        <SolidValue>1.422?</SolidValue>
      </Item>
      <Item>
        <ItemText>Market Ratio:</ItemText>
        <SolidValue>1.42?</SolidValue>
      </Item>
      <Item>
        <ItemText>Peg for 1k:</ItemText>
        <GreenItem>99.34%?</GreenItem>
      </Item>
    </ItemWrapper>
  )
}

export default function DefiWarsDropdown() {
  return <Dropdown content={getDefiWars()} logo={DEFIWAR_LOGO} text={'DefiWars'} />
}
