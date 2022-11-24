import React, { useMemo } from 'react'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'

import { useOwnerVeDeusNFTs } from 'hooks/useOwnerNfts'

import { Search as SearchIcon } from 'components/Icons'
import { InputWrapper, InputField } from 'components/Input'

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['name', 'value', 'nftId'],
    isCaseSensitive: false,
    threshold: 0.15,
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
  const nftIds = useOwnerVeDeusNFTs().results
  const nftIdsList = useMemo(() => {
    return [
      ...nftIds.map((id) => {
        return { nftId: id }
      }),
    ]
  }, [nftIds])

  const list: SelectSearchOption[] = useMemo(() => {
    return nftIdsList.map((o) => ({ ...o, name: 'veDEUS #' + o.nftId.toString(), value: o.nftId }))
  }, [nftIdsList])

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

export function SearchField({ searchProps, modalSearch }: { searchProps: any; modalSearch?: boolean }) {
  return (
    <InputWrapper ModalSearch={modalSearch}>
      <SearchIcon size={22} />
      <InputField
        {...searchProps}
        title="Search"
        autoFocus
        type="text"
        placeholder="Search Token"
        spellCheck="false"
        onBlur={() => null}
        style={{ marginLeft: '15px', fontSize: '16px' }}
      />
    </InputWrapper>
  )
}
