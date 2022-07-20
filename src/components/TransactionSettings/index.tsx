import { useState, useRef } from 'react'
import styled from 'styled-components'

import { useUserSlippageTolerance, useSetUserSlippageTolerance } from 'state/user/hooks'
import useOnOutsideClick from 'hooks/useOnOutsideClick'

import { Settings as SettingsIcon } from 'components/Icons'
import { Card } from 'components/Card'
import { Z_INDEX } from 'theme'

const Container = styled.div`
  overflow: hidden;
`

const InlineModal = styled(Card)<{
  isOpen: boolean
}>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  gap: 1rem;
  width: 250px;
  transform: translateX(calc(-250px + 18px)) translateY(10px);
  z-index: ${Z_INDEX.modal};
  padding: 0.8rem;
  border: 1px solid ${({ theme }) => theme.border2};
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
  height: 2.5rem;
  line-height: 2.5rem;
`

const InputRow = styled(Row)<{
  active?: boolean
  warning?: boolean
}>`
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  padding: 8px;
  border: ${({ theme, active, warning }) =>
    active ? `1px solid ${warning ? theme.red3 : theme.border1}` : '1px solid transparent'};
`

const WarningRow = styled.div<{
  error: boolean
}>`
  display: block;
  color: ${({ theme, error }) => (error ? theme.red3 : theme.yellow1)};
  font-size: 0.8rem;
`

const SlippageEmojiContainer = styled.span`
  margin-right: 5px;
  width: 30px;
  @media only screen and (max-width: 468px) {
    display: none;
  }
`

const Input = styled.input<{
  error: boolean
}>`
  background: transparent;
  text-align: right;
  font-size: 1rem;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, error }) => (error ? theme.red3 : theme.text2)};
  border: none;
`

const Option = styled.button<{
  active: boolean
}>`
  background: ${({ theme, active }) => (active ? theme.secondary2 : theme.bg1)};
  border-radius: 12px;
  text-align: center;
  height: 100%;
  font-size: 0.8rem;
  padding: 0 10px;

  &:hover {
    background: ${({ theme }) => theme.secondary1};
  }
`

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

export default function TransactionSettings({ ...rest }: { [x: string]: any }) {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen((prev) => !prev)
  useOnOutsideClick(ref, () => setIsOpen(false))

  const userSlippageTolerance = useUserSlippageTolerance()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const tooLow = userSlippageTolerance !== 'auto' && userSlippageTolerance < 0.1
  const tooHigh = userSlippageTolerance !== 'auto' && userSlippageTolerance > 1

  function parseSlippageInput(value: string) {
    setSlippageInput(value)
    setSlippageError(false)

    if (value.length === 0) {
      setUserSlippageTolerance('auto')
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100)

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setUserSlippageTolerance('auto')
        if (value !== '.') {
          setSlippageError(SlippageError.InvalidInput)
        }
      } else {
        setUserSlippageTolerance(parsed / 100)
      }
    }
  }

  return (
    <Container ref={ref} {...rest}>
      <SettingsIcon onClick={toggle} size="18px" isOpen={isOpen} />
      <InlineModal isOpen={isOpen}>
        Slippage Tolerance
        <Row>
          <Option onClick={() => parseSlippageInput('')} active={userSlippageTolerance === 'auto'}>
            Auto
          </Option>
          <InputRow active={userSlippageTolerance !== 'auto' || !!slippageError} warning={!!slippageError}>
            {tooLow || tooHigh ? (
              <SlippageEmojiContainer>
                <span role="img" aria-label="warning">
                  ⚠️
                </span>
              </SlippageEmojiContainer>
            ) : null}
            <Input
              placeholder="0.10"
              value={
                slippageInput.length > 0
                  ? slippageInput
                  : userSlippageTolerance === 'auto'
                  ? ''
                  : userSlippageTolerance.toFixed(2)
              }
              onChange={(e) => parseSlippageInput(e.target.value)}
              onBlur={() => {
                setSlippageInput('')
                setSlippageError(false)
              }}
              error={!!slippageError}
            />
            %
          </InputRow>
        </Row>
        {slippageError || tooLow || tooHigh ? (
          <WarningRow error={!!slippageError}>
            {slippageError
              ? 'Enter a valid slippage percentage'
              : tooLow
              ? 'Your transaction may fail'
              : 'Your transaction may be frontrun'}
          </WarningRow>
        ) : null}
      </InlineModal>
    </Container>
  )
}
