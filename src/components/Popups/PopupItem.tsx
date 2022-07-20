import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { animated } from 'react-spring'
import { useSpring } from '@react-spring/web'

import { PopupContent } from 'state/application/reducer'
import { useRemovePopup } from 'state/application/hooks'
import TransactionPopup from './TransactionPopup'

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-flow: column nowrap;
  width: 100%;
  margin-bottom: 10px;
  background: ${({ theme }) => theme.bg0};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border2};
`

const Fader = styled.div<{
  success: boolean
}>`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.primary1};
`

const AnimatedFader = animated(Fader)

export default function PopupItem({
  removeAfterMs,
  content,
  popKey,
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  const removePopup = useRemovePopup()
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
  useEffect(() => {
    if (removeAfterMs === null) return undefined

    const timeout = setTimeout(() => {
      removeThisPopup()
    }, removeAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [removeAfterMs, removeThisPopup])

  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration: removeAfterMs ?? undefined },
  })

  function getPopupContent(): JSX.Element | null {
    if ('txn' in content) {
      const {
        txn: { hash, success, summary },
      } = content
      return <TransactionPopup hash={hash} success={success} summary={summary} removeThisPopup={removeThisPopup} />
    } else {
      return null
    }
  }

  return (
    <Wrapper>
      {getPopupContent()}
      {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null}
    </Wrapper>
  )
}
