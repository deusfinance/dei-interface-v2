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
  const nfts = useUserBondNFTs()
  const nftIdsList = useMemo(() => {
    return [
      ...nfts.map((nft) => {
        return { nftId: nft.tokenId, ...nft }
      }),
    ]
  }, [nfts])

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
      <SearchIcon size={22} />
      <InputField
        {...searchProps}
        title="Search"
        autoFocus
        type="text"
        placeholder="Search NFT"
        spellCheck="false"
        onBlur={() => null}
        style={{ marginLeft: '15px', fontSize: '16px' }}
      />
    </InputWrapper>
  )
}
