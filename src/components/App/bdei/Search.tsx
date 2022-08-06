import React, { useMemo } from 'react'
import Fuse from 'fuse.js'
import { useSelect, SelectSearchOption } from 'react-select-search'

import { Search as SearchIcon } from 'components/Icons'
import { InputWrapper, InputField } from 'components/Input'
import { useUserBondNFTs } from 'hooks/useBondsPage'

function fuzzySearch(options: SelectSearchOption[]): any {
  const config = {
    keys: ['name', 'value', 'tokenId'],
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
  const nftIds = useUserBondNFTs()
  const nftIdsList = useMemo(() => {
    return [
      ...nftIds.map((nft) => {
        return { nftId: nft.tokenId, ...nft }
      }),
    ]
  }, [nftIds])

  const list: SelectSearchOption[] = useMemo(() => {
    return nftIdsList.map((o) => ({ ...o, name: 'DeiBond #' + o.nftId.toString(), value: o.nftId }))
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
