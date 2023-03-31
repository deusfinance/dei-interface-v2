import CLQDR_LOGO from '/public/static/images/tokens/clqdr.svg'

import { ExternalLink } from 'components/Link'
import { truncateAddress } from 'utils/address'
import Dropdown from 'components/App/CLqdr/Dropdown'
import { ItemWrapper, Item, ItemText, ItemValue } from '.'

function getContracts(): JSX.Element {
  return (
    <ItemWrapper>
      <Item>
        <ItemText>LQDR contract:</ItemText>
        <ItemValue>
          <ExternalLink
            href={`https://ftmscan.com/address/0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9`}
            style={{ textDecoration: 'underline' }}
          >
            {truncateAddress(`0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9`)}
          </ExternalLink>
        </ItemValue>
      </Item>
      <Item>
        <ItemText>cLQDR contract:</ItemText>
        <ItemValue>
          <ExternalLink
            href={`https://ftmscan.com/address/0x814c66594a22404e101FEcfECac1012D8d75C156`}
            style={{ textDecoration: 'underline' }}
          >
            {truncateAddress('0x814c66594a22404e101FEcfECac1012D8d75C156')}
          </ExternalLink>
        </ItemValue>
      </Item>
      <Item>
        <ItemText>Collector Proxy:</ItemText>
        <ItemValue>
          <ExternalLink
            href={`https://ftmscan.com/address/0x30d1900306FD84EcFBCb16F821Aba69054aca15C`}
            style={{ textDecoration: 'underline' }}
          >
            {truncateAddress('0x30d1900306FD84EcFBCb16F821Aba69054aca15C')}
          </ExternalLink>
        </ItemValue>
      </Item>
      <Item>
        <ItemText>BuyBack Contract:</ItemText>
        <ItemValue>
          <ExternalLink
            href={`https://ftmscan.com/address/0xCD3563CD8dE2602701d5d9f960db30710fcc4053`}
            style={{ textDecoration: 'underline' }}
          >
            {truncateAddress('0xCD3563CD8dE2602701d5d9f960db30710fcc4053')}
          </ExternalLink>
        </ItemValue>
      </Item>
      <Item>
        <ItemText>Oracle:</ItemText>
        <ItemValue>
          <ExternalLink
            href={`https://ftmscan.com/address/0x2e5a83cE42F9887E222813371c5cA2bA1e827700`}
            style={{ textDecoration: 'underline' }}
          >
            {truncateAddress('0x2e5a83cE42F9887E222813371c5cA2bA1e827700')}
          </ExternalLink>
        </ItemValue>
      </Item>
    </ItemWrapper>
  )
}

export default function ContractsDropdown() {
  return <Dropdown content={getContracts()} logo={CLQDR_LOGO} text={'Contracts'} />
}
