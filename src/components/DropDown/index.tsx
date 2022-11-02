import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { css } from 'styled-components'
import find from 'lodash/find'

import useOnOutsideClick from 'hooks/useOnOutsideClick'
import { ChevronDown } from 'components/Icons'
import { DropDownName, DropDownValue } from 'components/App/CLqdr/StatsHeader'
import Box from 'components/Box'
import { truncateAddress } from 'utils/address'

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
  padding: 0 0rem;
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
  height: 48px;
  border-top: none;
  line-height: 40px;
  font-size: 13px;
  z-index: 999;
  color: ${({ theme }) => theme.text1};
  margin: 15px 0px;

  &:hover {
    cursor: pointer;
    background: ${({ theme }) => theme.bg4};
  }
`

const OptionItem = styled.div`
  background: ${({ theme }) => theme.bg1};
  width: 162px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0px 8px;
  & > * {
    &:first-child {
      margin-bottom: 5px;
    }
  }
`

interface Option {
  value: string
  name: string
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
  onSelect: (val: number) => void
  width: string
  defaultValue?: number
  disabled?: boolean
}) {
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string>('')

  useOnOutsideClick(ref, () => setIsOpen(false))

  useEffect(() => {
    if (options.length > 0) {
      const value = defaultValue ? options[defaultValue].value : options[0].value
      setSelectedOption(value)
    }
  }, [options, defaultValue, onSelect])

  const header: JSX.Element | string = useMemo(() => {
    const option: Option | undefined = find(options, (obj) => obj.value == selectedOption)
    return option ? (
      <OptionItem>
        <DropDownName>{option?.name}</DropDownName>
        <DropDownValue>{truncateAddress(option?.value)}</DropDownValue>
      </OptionItem>
    ) : (
      placeholder
    )
  }, [options, selectedOption, placeholder])

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
              onSelect(i)
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
