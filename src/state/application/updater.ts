import { useCallback, useEffect, useState } from 'react'
import { Block } from '@ethersproject/abstract-provider'
import { useAppDispatch } from 'state'

import useWeb3React from 'hooks/useWeb3'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import useDebounce from 'hooks/useDebounce'
import { SupportedChainId } from 'constants/chains'

import { updateBlockNumber, updateBlockTimestamp, updateChainId } from './actions'

export default function Updater(): null {
  const { library, chainId } = useWeb3React()
  const dispatch = useAppDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{
    chainId: number | undefined
    blockNumber: number | null
    blockTimestamp: number | null
  }>({
    chainId,
    blockNumber: null,
    blockTimestamp: null,
  })

  const blockCallback = useCallback(
    (block: Block) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number' && typeof state.blockTimestamp !== 'number') {
            return { chainId, blockNumber: block.number, blockTimestamp: block.timestamp }
          }
          return {
            chainId,
            blockNumber: Math.max(block.number, state.blockNumber ?? 0),
            blockTimestamp: Math.max(block.timestamp, state.blockTimestamp ?? 0),
          }
        }
        return state
      })
    },
    [chainId, setState]
  )

  const onBlock = useCallback(
    (number) => library && library.getBlock(number).then(blockCallback),
    [blockCallback, library]
  )

  // Attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null, blockTimestamp: null })

    library
      .getBlock('latest')
      .then(blockCallback)
      .catch((error) => console.error(`Failed to get block for chainId: ${chainId}`, error))

    library.on('block', onBlock)
    return () => {
      library.removeListener('block', onBlock)
    }
  }, [dispatch, chainId, library, windowVisible, blockCallback, onBlock])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockTimestamp || !windowVisible) return
    dispatch(updateBlockTimestamp({ chainId: debouncedState.chainId, blockTimestamp: debouncedState.blockTimestamp }))
  }, [windowVisible, dispatch, debouncedState.blockTimestamp, debouncedState.chainId])

  useEffect(() => {
    dispatch(
      updateChainId({ chainId: debouncedState.chainId in SupportedChainId ? debouncedState.chainId ?? null : null })
    )
  }, [dispatch, debouncedState.chainId])

  return null
}
