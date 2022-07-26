import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { ChevronDown } from 'react-feather'

import ImageWithFallback from 'components/ImageWithFallback'
import { Row } from 'components/Row'

const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  height: 80px;
  gap: 10px;
  border: 1px solid #444444;
  border-color: ${({ theme }) => theme.border1};
  position: relative;
  cursor: ${({ disabled }) => !disabled && 'pointer'};

  &:hover {
    border-color: ${({ theme }) => theme.border3};
    background: ${({ theme }) => theme.bg3};
  }
`

const InputWrapper = styled.div<{
  active: string
}>`
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text2)};

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    right: 0;
  `}
`

const ItemWrapper = styled.div`
  width: 100%;
  padding: 6px;
  position: relative;
`

export const LogoWrapper = styled(Row)`
  height: 100%;
  border-right: 1px solid ${({ theme }) => theme.border1};
  padding-left: 10px;
  min-width: 48px;
  max-width: 61px; //because of border-right
`

const StyledChevron = styled(ChevronDown)`
  size: 20px;
  position: absolute;
  right: 16px;
`

export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function SelectBox({
  value,
  currentItem,
  onSelect,
  icon,
  placeholder,
  disabled,
}: {
  value: string
  currentItem?: JSX.Element | null
  onSelect?: any
  icon: string | StaticImageData
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <>
      <Wrapper disabled={disabled} onClick={onSelect ? () => onSelect() : undefined}>
        <LogoWrapper>
          <ImageWithFallback src={icon} width={getImageSize()} height={getImageSize()} alt={`Logo`} round />
        </LogoWrapper>
        {currentItem ? (
          currentItem
        ) : (
          <ItemWrapper>
            <InputWrapper active={value}>{value || placeholder}</InputWrapper>
          </ItemWrapper>
        )}
        <StyledChevron />
      </Wrapper>
    </>
  )
}
