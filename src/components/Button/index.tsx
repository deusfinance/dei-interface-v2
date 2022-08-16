import styled from 'styled-components'

export const BaseButton = styled.div<{
  active?: boolean
  disabled?: boolean
}>`
  font-family: 'Inter';
  padding: 1rem;
  width: 100%;
  font-weight: 500;
  text-align: center;
  border-radius: 4px;
  outline: none;
  color: black;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }
  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);
  > * {
    user-select: none;
  }
  > a {
    text-decoration: none;
  }
`

export const NavButton = styled.button`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  height: 35px;
  font-size: 15px;
  align-items: center;
  text-align: center;
  padding: 0 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.text3};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  &:hover,
  &:focus {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.text1};
  }
`

export const PrimaryButton = styled(BaseButton)`
  background: ${({ theme }) => theme.specialBG1};
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  font-size: 20px;
  z-index: 0;
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary7};
    background: ${({ theme }) => theme.primary7};
  }
  &:hover {
    background: ${({ theme }) => theme.primary7};
  }

  ${({ theme, disabled }) =>
    disabled &&
    `
      background: ${theme.bg2};
      border: 1px solid ${theme.border1};
      cursor:default;

      &:focus,
      &:hover {
        background: ${theme.bg2};
      }
  `}
`

export const PrimaryButtonWide = styled(BaseButton)<{ isSmall?: boolean; width?: string }>`
  background: ${({ theme }) => theme.specialBG1};
  white-space: nowrap;
  border-radius: 8px;
  height: 54%;
  width: ${({ width }) => (width ? width : 'auto')};
  color: ${({ theme }) => theme.text1};

  z-index: 0;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary2};
    background: ${({ theme }) => theme.primary7};
  }
  &:hover {
    background: ${({ theme }) => theme.primary7};
  }

  ${({ theme, disabled }) =>
    disabled &&
    `
      height: 100%;
      background: ${theme.bg2};
      border: 1px solid ${theme.border1};

      &:focus,
      &:hover {
        background: inherit;
      }
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    & > * {
      margin: -4px;
    }
  `}

  ${({ isSmall, theme }) =>
    isSmall &&
    theme.mediaWidth.upToExtraSmall`
      padding-top: 12px;
      padding-bottom: 12px;
  `}
`

export const PrimaryButtonWhite = styled(BaseButton)`
  background: ${({ theme }) => theme.primary2};
  white-space: nowrap;
  border-radius: 8px;
  height: 53%;

  color: ${({ theme }) => theme.text1};
  z-index: 0;

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.primary2};
    background: ${({ theme }) => theme.bg0};
  }
  &:hover {
    background: ${({ theme }) => theme.bg0};
    border: 3px solid ${({ theme }) => theme.text1};
  }

  ${({ theme, disabled }) =>
    disabled &&
    `
      background: ${theme.bg2};
      border: 1.5px solid ${theme.text1};

      &:focus,
      &:hover {
        background: ${theme.bg0};
      }
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 110%;
    padding-top: 12px;
    padding-bottom: 12px;
    & > * {
      margin: -5px;
    }
  `}
`

export const OptionButton = styled(BaseButton)<{ active?: any }>`
  height: 36px;
  width: 62px;
  font-size: 13px;
  padding: 0;
  border-radius: 6px;
  color: ${({ theme }) => theme.text1};
  border: 1.5px solid ${({ theme, active }) => (active ? theme.border2 : theme.border1)};
  background: ${({ theme, active }) => (active ? theme.bg3 : 'transparent')};
  position: relative;
  z-index: 1;
  transition: all 0.1s;
  cursor: ${({ active }) => active && 'pointer'};

  ${({ theme }) => theme.mediaWidth.upToMedium`
      margin-right: 3px;
      // width: 48px;
  `}

  &:hover {
    border: 1.5px solid ${({ theme, active }) => (active ? theme.border3 : theme.text1)};
  }
`
