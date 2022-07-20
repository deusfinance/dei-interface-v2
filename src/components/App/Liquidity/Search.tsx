import React, { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'

import { useFetchSolidlyPairsCallback } from 'hooks/useSolidlyData'
import { SolidlyPair } from 'apollo/queries'
import { Search as SearchIcon } from 'components/Icons'
import { InputWrapper, InputField } from 'components/Input'

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['id', 'symbol', 'token0.symbol', 'token1.symbol'],
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
  const [solidlyPairs, setSolidlyPairs] = useState<SolidlyPair[]>([])
  const fetchSolidlyPairs = useFetchSolidlyPairsCallback()

  useEffect(() => {
    const getSolidlyPairs = async () => {
      const result = await fetchSolidlyPairs()
      setSolidlyPairs(result)
    }
    getSolidlyPairs()
  }, [fetchSolidlyPairs])

  const list: SelectSearchOption[] = useMemo(() => {
    return solidlyPairs.map((o) => ({ ...o, name: o.name, value: o.id }))
  }, [solidlyPairs])

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
        placeholder="Search for a pool, symbol or contract"
        spellCheck="false"
        onBlur={() => null}
      />
      <SearchIcon />
    </InputWrapper>
  )
}
