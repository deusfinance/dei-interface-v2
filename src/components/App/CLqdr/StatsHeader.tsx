import React, { useMemo } from 'react'
import styled from 'styled-components'

import { ToolTip } from 'components/ToolTip'
import { Info } from 'components/Icons'
import { ChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ExternalLink } from 'components/Link'
import Dropdown from 'components/DropDown'
import { truncateAddress } from 'utils/address'

const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  margin: 20px 2px 0px 2px;
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: stretch;
  `};
`

const Item = styled.div<{ rightBorder?: boolean }>`
  display: inline-block;
  padding: 0 24px;
  border-right: ${({ theme, rightBorder }) => (rightBorder ? `1px solid ${theme.border1}` : 'unset')};
`

export const DropDownItem = styled(Item)`
  width: 162px;
  /* height: 56px; */
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0px 8px;
  background: ${({ theme }) => theme.bg0};
`

export const DropDownName = styled.p`
  font-family: 'Inter';
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  color: ${({ theme }) => theme.text2};
  /* margin-bottom: 8px; */
`
export const DropDownValue = styled.p`
  font-weight: 400;
  font-size: 12px;
  text-decoration-line: underline;
  margin-top: -5px;
  color: ${({ theme }) => theme.text1};
`

const ItemBox = styled.div`
  display: inline-block;
  padding: 8px 10px;
  margin: 0 24px;
  background: ${({ theme }) => theme.bg4};
  border: 2px solid ${({ theme }) => theme.text3};
  border-radius: 8px;
`

const Name = styled.div`
  font-family: 'Inter';
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
`

const Value = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
`

const ValueLink = styled(Value)`
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.darkPink};
  }
`

const CustomTooltip = styled(ToolTip)`
  max-width: 380px !important;
`

const InfoIcon = styled(Info)`
  color: ${({ theme }) => theme.yellow4};
`

const AprWrapper = styled.a`
  align-items: center;
  text-decoration: none;
  justify-content: center;
  color: ${({ theme }) => theme.text1};
  display: flex;

  :hover {
    opacity: 0.7;
    text-decoration: underline;
    color: ${({ theme }) => theme.yellow4};
  }
  :focus {
    outline: none;
  }
`

const TextContent = styled.p`
  margin-right: 10px;
  font-size: 14px;
`

function DropDownOption({ name, value }: { name: string; value: string }): JSX.Element {
  return (
    <DropDownItem>
      <DropDownName>{name}</DropDownName>
      <ExternalLink href={`https://ftmscan.com/address/${value}`} style={{ textDecoration: 'none' }}>
        <DropDownValue>{truncateAddress(value)}</DropDownValue>
      </ExternalLink>
    </DropDownItem>
  )
}

export default function StatsHeader({
  items,
  hasBox,
}: {
  items: { name: string; value: string | number; link?: string }[]
  hasBox?: boolean
}) {
  const contractAddresses = useMemo(
    () => [
      { name: 'cLQDR contract', value: '0x814c66594a22404e101FEcfECac1012D8d75C156' },
      { name: 'Collector proxy', value: '0x30d1900306FD84EcFBCb16F821Aba69054aca15C' },
      { name: 'BuyBack Contract', value: '0xCD3563CD8dE2602701d5d9f960db30710fcc4053' },
      { name: 'Oracle', value: '0x2e5a83cE42F9887E222813371c5cA2bA1e827700' },
    ],
    []
  )
  const dropDownOptions = contractAddresses.map((t) => {
    return { value: t.value, label: DropDownOption({ name: t.name, value: t.value }) }
  })
  return (
    <Wrapper>
      {items.map((item, index) => (
        <Item key={index} rightBorder={true}>
          <Name>{item.name}</Name>
          {!item.link ? (
            <Value>{item.value}</Value>
          ) : (
            <ExternalLink href={ChainInfo[SupportedChainId.FANTOM].blockExplorerUrl + '/address/' + item.link}>
              <ValueLink>{item.value}</ValueLink>
            </ExternalLink>
          )}
        </Item>
      ))}
      {hasBox && (
        <ItemBox data-for="id" data-tip={'Rewards are accruing in the background'}>
          <CustomTooltip id="id" />
          <AprWrapper target={'target'} href={'https://lafayettetabor.medium.com/vedeus-dynamics-40a4a5489ae1'}>
            <TextContent>APR</TextContent> <InfoIcon size={20} />
          </AprWrapper>
        </ItemBox>
      )}
      <Dropdown options={dropDownOptions} placeholder={'Contracts'} onSelect={() => console.log('')} width={'162px'} />
    </Wrapper>
  )
}
