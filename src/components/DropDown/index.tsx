import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { css } from 'styled-components'
import find from 'lodash/find'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { ChevronDown } from 'components/Icons'
import Box from 'components/Box'

const Wrapper = styled.div<{
  width: string
}>`
  display: block;
  overflow: hidden;
  color: ${({ theme }) => theme.text3};
  max-width: ${({ width }) => width};
  width: 100%;
  margin: 4px auto;
`

const Header = styled(Box)<{
  noHover?: boolean
  isOpen?: boolean
}>`
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  text-align: left;
  padding: 0 0.8rem;
  align-items: center;
  height: 100%;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};

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

const StyledChevron = styled(({ isOpen, ...props }) => <ChevronDown {...props} />)<{
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
  height: 40px;
  border-top: none;
  line-height: 40px;
  padding: 0 10px;
  font-size: 13px;
  z-index: 999;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg1};
  }
`

interface Option {
  value: string
  label: JSX.Element | string
}

export default function Dropdown({
  options = [],
  placeholder = 'Select',
  onSelect,
  defaultValue,
  width,
  disabled = false,
}: {
  options: Option[]
  placeholder: string
  onSelect: (val: string) => void
  defaultValue?: string
  width: string
  disabled?: boolean
}) {
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string>('')

  useOnOutsideClick(ref, () => setIsOpen(false))

  useEffect(() => {
    if (options.length > 0) {
      const value = defaultValue ?? options[0].value
      onSelect(value)
      setSelectedOption(value)
    }
  }, [options, defaultValue, onSelect])

  const header: JSX.Element | string = useMemo(() => {
    const option: Option | undefined = find(options, (obj) => obj.value == selectedOption)
    return option?.label ?? placeholder
  }, [options, selectedOption, placeholder])

  const toggle = () => {
    !disabled && setIsOpen(!isOpen)
  }

  if (!options.length) {
    return (
      <Wrapper ref={ref} width={width}>
        <Header noHover>No options available</Header>
      </Wrapper>
    )
  }

  if (options.length == 1) {
    return (
      <Wrapper ref={ref} width={width}>
        <Header noHover>{options[0].label}</Header>
      </Wrapper>
    )
  }

  return (
    <Wrapper ref={ref} width={width}>
      <Header onClick={toggle} isOpen={isOpen}>
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
