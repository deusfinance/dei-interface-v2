import React, { useState, useRef, useMemo, useEffect } from 'react'
import styled, { css } from 'styled-components'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { ChevronDown } from 'components/Icons'
import Box from 'components/Box'
import find from 'lodash/find'

const Wrapper = styled.div<{
  width: string
}>`
  display: block;
  overflow: hidden;
  margin-left: 12px;
  color: ${({ theme }) => theme.text3};
  max-width: ${({ width }) => width};
  width: 100%;
`

const Header = styled(Box)<{
  noHover?: boolean
  isOpen?: boolean
  width: string
}>`
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  text-align: left;
  padding: 10px;
  align-items: center;
  height: 48px;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  width: ${({ width }) => width};

  &:hover {
    cursor: ${({ noHover }) => (noHover ? 'default' : 'pointer')};
  }

  ${({ theme, isOpen }) =>
    isOpen &&
    `
    background: ${theme.bg1};
    border: 1px solid ${theme.border2};
  `}
`

const StyledChevron = styled(({ ...props }) => <ChevronDown {...props} />)<{
  isOpen?: boolean
}>`
  transition: transform 0.5s ease-out;
  size: 2rem;
  ${(props) =>
    props.isOpen &&
    css`
      transform: scaleY(-1);
    `};
`

const List = styled.ul<{
  width: string
  isOpen?: boolean
}>`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.border2};
  border-top: none;
  overflow: hidden;
  position: absolute;
  z-index: 999;
  width: 100%;
  max-width: ${({ width }) => width};

  & > * {
    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.border2};
    }
  }
`

const ListItem = styled.li`
  list-style: none;
  text-align: left;
  border-top: none;
  line-height: 17px;
  font-size: 14px;
  z-index: 999;
  color: ${({ theme }) => theme.text1};
  padding: 10px;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg4};
  }
`

export interface Option {
  value: string
  label: JSX.Element | string
}

export default function Dropdown({
  options = [],
  placeholder = 'Contracts',
  onSelect,
  width,
  defaultValue,
  disabled = false,
}: {
  options: Option[]
  placeholder: string
  onSelect: (val: string) => void
  width: string
  defaultValue?: string
  disabled?: boolean
}) {
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string>(defaultValue || '')

  useOnOutsideClick(ref, () => setIsOpen(false))

  useEffect(() => {
    if (!selectedOption) setSelectedOption(options[0]?.value ?? defaultValue)
  }, [options, defaultValue, selectedOption])

  const header: JSX.Element | string = useMemo(() => {
    const option: Option | undefined = find(options, (obj) => obj.value == selectedOption)
    return option?.label ?? placeholder
  }, [selectedOption, options, placeholder])

  const toggle = () => {
    !disabled && setIsOpen(!isOpen)
  }

  if (!options.length) {
    return (
      <Wrapper ref={ref} width={width}>
        <Header width={width} noHover>
          No options available
        </Header>
      </Wrapper>
    )
  }

  if (options.length == 1) {
    return (
      <Wrapper ref={ref} width={width}>
        <Header width={width} noHover>
          {options[0].label}
        </Header>
      </Wrapper>
    )
  }

  return (
    <Wrapper ref={ref} width={width}>
      <Header onClick={toggle} isOpen={isOpen} width={width}>
        {header}
        {!disabled && <StyledChevron isOpen={isOpen} />}
      </Header>
      <List isOpen={isOpen} width={width}>
        {options.map((option, i) => (
          <ListItem
            key={i}
            onClick={() => {
              const selected = option.value
              onSelect(selected)
              setSelectedOption(selected)
              toggle()
            }}
          >
            {option.label}
          </ListItem>
        ))}
      </List>
    </Wrapper>
  )
}
