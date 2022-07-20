import styled from 'styled-components'

import { useActivePopups } from 'state/application/hooks'
import useWindowSize from 'hooks/useWindowSize'

import PopupItem from './PopupItem'
import { Z_INDEX } from 'theme'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: fixed;
  height: auto;
  top: 75px;
  z-index: ${Z_INDEX.popover};
`

const ContainerLarge = styled(Container)`
  right: 30px;
  width: 300px;
`

const ContainerSmall = styled(Container)`
  margin-left: 50%;
  transform: translateX(-50%);
  width: 90vw;
`

export default function Popups() {
  const activePopups = useActivePopups()
  const { width } = useWindowSize()

  return (
    <>
      {typeof width == 'number' && width >= 500 ? (
        <ContainerLarge>
          {activePopups.map((item) => {
            return (
              <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
            )
          })}
        </ContainerLarge>
      ) : (
        <ContainerSmall>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
            ))}
        </ContainerSmall>
      )}
    </>
  )
}
