import styled from 'styled-components'

export { default as ArrowBubble } from './ArrowBubble'
export { default as CheckMark } from './CheckMark'
export { default as CreditCard } from './CreditCard'
export { Close } from './Close'
export { ConfirmationAnimation } from './Confirmation'
export { ChevronLeft, ChevronDown, ChevronUp } from './Chevron'
export { default as DotFlashing } from './DotFlashing'
export { default as Droplet } from './Droplet'
export { default as Info } from './Info'
export { default as Gift } from './Gift'
export { default as GreenCircle } from './GreenCircle'
export { default as Connected } from './Connected'
export { default as Copy } from './Copy'
export { default as Loader } from './Loader'
export { default as Lock } from './Lock'
export { default as NavToggle } from './NavToggle'
export { Network } from './Network'
export { default as Markets } from './Markets'
export { default as Portfolio } from './Portfolio'
export { default as Search } from './Search'
export { Settings } from './Settings'
export { Twitter, Telegram, Github } from './Socials'
export { default as ThemeToggle } from './ThemeToggle'
export { default as Trade } from './Trade'
export { Wallet } from './Wallet'
export { default as Redeem } from './Redeem'

// for wrapping react feather icons
export const IconWrapper = styled.div<{ stroke?: string; size?: string; marginRight?: string; marginLeft?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size ?? '20px'};
  height: ${({ size }) => size ?? '20px'};
  margin-right: ${({ marginRight }) => marginRight ?? 0};
  margin-left: ${({ marginLeft }) => marginLeft ?? 0};
  & > * {
    stroke: ${({ theme, stroke }) => stroke && theme.text1};
  }
`
