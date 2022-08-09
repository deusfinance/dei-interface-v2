import React from 'react'
import styled from 'styled-components'

import { ToolTip } from 'components/ToolTip'
import { Info } from 'components/Icons'

const Wrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  margin: 17px 2px 0px 2px;
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
  display: flex;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin-top: 10px;
  justify-content: center;
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

export default function StatsHeader({ items, hasBox }: { items: { name: string; value: string }[]; hasBox?: boolean }) {
  return (
    <Wrapper>
      {items.map((item, index) => (
        <Item key={index} rightBorder={index < items.length - 1 || hasBox}>
          <Name>{item.name}</Name>
          <Value>{item.value}</Value>
        </Item>
      ))}
      {hasBox && (
        <ItemBox data-for="id" data-tip={'veDEUS rewards are fully accruing in the Background'}>
          <CustomTooltip id="id" />
          <AprWrapper target={'target'} href={'https://lafayettetabor.medium.com/vedeus-dynamics-40a4a5489ae1'}>
            <TextContent>APR</TextContent> <InfoIcon size={20} />
          </AprWrapper>
        </ItemBox>
      )}
    </Wrapper>
  )
}
