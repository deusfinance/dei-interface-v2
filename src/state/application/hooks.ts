import { useCallback, useMemo } from 'react'
import { AppState, useAppDispatch, useAppSelector } from 'state'

import useWeb3React from 'hooks/useWeb3'
import { addPopup, removePopup, setOpenModal } from './actions'
import { ApplicationModal, Popup, PopupContent, PopupList } from './reducer'
import { REMOVE_AFTER_MS, L2_REMOVE_AFTER_MS } from 'constants/popup'

export function useBlockNumber(): number | undefined {
  const { chainId } = useWeb3React()
  return useAppSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useNetworkModalToggle(): () => void {
  return useToggleModal(ApplicationModal.NETWORK)
}

export function useDashboardModalToggle(): () => void {
  return useToggleModal(ApplicationModal.DASHBOARD)
}

export function useVoucherModalToggle(): () => void {
  return useToggleModal(ApplicationModal.VOUCHER)
}

export function useAddPopup(): (content: PopupContent, key?: string, removeAfterMs?: number) => void {
  const dispatch = useAppDispatch()
  const { chainId } = useWeb3React()

  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number) => {
      const ms = removeAfterMs ?? chainId == 1 ? REMOVE_AFTER_MS : L2_REMOVE_AFTER_MS
      dispatch(addPopup({ content, key, removeAfterMs: ms }))
    },
    [dispatch, chainId]
  )
}

export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

export function useActivePopups(): PopupList {
  const list = useAppSelector((state: AppState) => {
    return state.application.popupList
  })
  return useMemo(() => list.filter((item: Popup) => item.show), [list])
}
