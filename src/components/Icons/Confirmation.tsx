import styled, { keyframes } from 'styled-components'
import { Settings as SettingsIcon } from 'react-feather'

interface SvgStyledProps {
  className?: string
  size?: string
  color?: string
}

const rotate = keyframes`
  from {
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
`

export const ConfirmationAnimation = styled(({ size = '15px', color = '#919191', ...props }) => (
  <SettingsIcon size={size} color={color} {...props} />
))<SvgStyledProps>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  color: ${(props) => props.color};
  animation: ${rotate} 15s linear infinite;
`
