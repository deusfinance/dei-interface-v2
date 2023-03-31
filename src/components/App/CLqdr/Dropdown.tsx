import { useState } from 'react'
import styled from 'styled-components'
import Collapsible from 'react-collapsible'

import { Row, RowEnd } from 'components/Row'
import { ChevronDown, ChevronUp } from 'components/Icons'
import ImageWithFallback from 'components/ImageWithFallback'

const MainDropdown = styled(Collapsible)`
  height: 60px;
  cursor: pointer;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg1};
`

const DropdownHeader = styled(Row)<{ borderBottom?: boolean }>`
  height: 60px;
  display: flex;
  padding: 20px 16px;
  background: ${({ theme }) => theme.bg1};
  border-radius: ${({ borderBottom }) => (borderBottom ? '12px' : '12px 12px 0px 0px')};
`

const Logo = styled.div`
  min-height: 28px;
  min-width: 28px;
`

const Text = styled.div`
  font-family: 'IBM Plex Mono';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  white-space: nowrap;
  margin-left: 8px;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
`

export default function Dropdown({ content, logo, text }: { content: JSX.Element; logo: any; text: string }) {
  const [border, setBorder] = useState(true)

  function handleClick() {
    setBorder(!border)
  }

  function getTriggers(logo: any, text: string): React.ReactElement<any> | string {
    return (
      <DropdownHeader borderBottom={border}>
        <Logo>
          <ImageWithFallback src={logo} width={28} height={28} alt={'logo'} round />
        </Logo>
        <Text>{text}</Text>
        <RowEnd>{border ? <ChevronDown /> : <ChevronUp />}</RowEnd>
      </DropdownHeader>
    )
  }

  return (
    <MainDropdown
      trigger={getTriggers(logo, text)}
      onOpen={handleClick}
      onClose={handleClick}
      transitionTime={120}
      transitionCloseTime={120}
      easing={'step-start'}
    >
      {content}
    </MainDropdown>
  )
}
