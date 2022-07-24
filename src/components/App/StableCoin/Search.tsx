import React, { useMemo } from 'react'
import styled from 'styled-components'
import Fuse from 'fuse.js'
import { Token } from '@sushiswap/core-sdk'
import { useSelect, SelectSearchOption } from 'react-select-search'

import { Search as SearchIcon } from 'components/Icons'
import { InputWrapper, InputField } from 'components/Input'

const SearchWrapper = styled(InputWrapper)`
  height: 60px;
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.border3};
  border-radius: 12px;
  & > * {
    &:last-child {
      font-size: 1rem;
      margin-left: 16px;
    }
  }
`

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['symbol', 'name', 'address'],
    isCaseSensitive: false,
    threshold: 0.2,
  }

  const fuse = new Fuse(options, config)

  return (query: string) => {
    if (!query) return options
    return fuse.search(query)
  }
}

export function useSearch(tokens: Token[]) {
  // const tokens = allTokens
  const list = useMemo(() => {
    return tokens.map((token) => ({ ...token, name: token.name, value: token.symbol }))
  }, [tokens])

  const [snapshot, searchProps, optionProps] = useSelect({
    options: list as SelectSearchOption[],
    value: '',
    search: true,
    filterOptions: fuzzySearch,
    allowEmpty: true,
    closeOnSelect: false,
  })
  return {
    snapshot,
    searchProps,
    optionProps,
  }
}

export function SearchField({ searchProps }: { searchProps: any }) {
  return (
    <SearchWrapper>
      <SearchIcon />

      <InputField
        {...searchProps}
        title="Search"
        autoFocus
        type="text"
        placeholder="Search for a token"
        spellCheck="false"
        onBlur={() => null}
      />
    </SearchWrapper>
  )
}
