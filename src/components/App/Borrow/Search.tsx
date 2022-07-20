import React, { useMemo } from 'react'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'

import { useBorrowPools } from 'state/borrow/hooks'
import { Search as SearchIcon } from 'components/Icons'
import { InputWrapper, InputField } from 'components/Input'

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['contract', 'composition.name'],
    isCaseSensitive: false,
    threshold: 0.2,
  }

  const fuse = new Fuse(options, config)

  return (query: string) => {
    if (!query) {
      return options
    }

    return fuse.search(query)
  }
}

export function useSearch() {
  const borrowList = useBorrowPools()
  const list: SelectSearchOption[] = useMemo(() => {
    return borrowList.map((o) => ({ ...o, name: o.composition, value: o.contract.address }))
  }, [borrowList])

  const [snapshot, searchProps, optionProps] = useSelect({
    options: list,
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
    <InputWrapper>
      <InputField
        {...searchProps}
        title="Search"
        autoFocus
        type="text"
        placeholder="Search"
        spellCheck="false"
        onBlur={() => null}
      />
      <SearchIcon />
    </InputWrapper>
  )
}
