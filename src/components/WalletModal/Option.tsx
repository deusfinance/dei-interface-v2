import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { darken } from 'polished'

import { IconWrapper, GreenCircle } from 'components/Icons'
import { ExternalLink } from 'components/Link'

const Wrapper = styled.button<{
  disabled?: boolean
  active?: boolean
  clickable?: boolean
  onClick: () => void
}>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem;
  background: ${({ theme }) => theme.bg1};
  border-radius: 10px;
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  outline: none;
  border: 1px solid ${({ active, theme }) => (active ? theme.secondary2 : 'transparent')};
  width: 100%;
  box-sizing: border-box;

  &:hover,
  &:focus {
    cursor: pointer;
    border: 1px solid ${({ theme, clickable }) => (clickable ? theme.secondary1 : 'transparent')};
  }

  ${({ theme, clickable }) =>
    !clickable &&
    `
    background: ${darken(0.07, theme.bg1)};
    border: 1px solid transparent;
    &:hover,
    &:focus {
      cursor: default;
    }
  `}
`

const WrapperLeft = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  height: 100%;
`

const HeaderText = styled.div`
  display: flex;
  flex-flow: row nowrap;
  font-size: 1.1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 0.9rem;
  `};
`

const SubHeader = styled.div`
  margin-top: 10px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text2};
`

export default function Option({
  link = null,
  clickable = true,
  size = 30,
  onClick = () => null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
}: {
  link?: string | null
  clickable?: boolean
  size?: number
  onClick?: () => void
  color: string
  header: React.ReactNode
  subheader: React.ReactNode | null
  icon: StaticImageData
  active?: boolean
}) {
  const content = (
    <Wrapper onClick={() => onClick()} clickable={clickable && !active} active={active}>
      <WrapperLeft>
        <HeaderText color={color}>
          {active && (
            <IconWrapper>
              <GreenCircle />
            </IconWrapper>
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </WrapperLeft>
      <Image src={icon} alt={'Icon'} width={size} height={size} />
    </Wrapper>
  )
  if (link) {
    return <ExternalLink href={link}>{content}</ExternalLink>
  }

  return content
}
