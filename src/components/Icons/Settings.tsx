import styled, { css } from 'styled-components'
import { Settings as SettingsIcon } from 'react-feather'

interface SvgStyledProps {
  className?: string
  isOpen: boolean
}

export const Settings = styled(({ isOpen, ...props }) => <SettingsIcon isOpen={isOpen} {...props} />)<SvgStyledProps>`
  width: ${(props) => props.size ?? '15px'};
  height: ${(props) => props.size ?? '15px'};
  color: ${(props) => props.color ?? '#919191'};
  margin-right: 2px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  transition: transform 0.3s ease-in;
  ${(props) =>
    props.isOpen &&
    css`
      transform: rotate(90deg);
    `};
`
