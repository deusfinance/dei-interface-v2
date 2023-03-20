import React from 'react'
import styled from 'styled-components'

import Box from 'components/Box'

export const InputWrapper = styled(Box)<{ ModalSearch?: boolean }>`
  padding: 0 20px;
  border-radius: ${({ ModalSearch }) => (ModalSearch ? '12px' : '8px')};
`

export const InputField = styled.input<{
  [x: string]: any
}>`
  height: 40px;
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-family: 'Inter';
  color: ${({ theme }) => theme.text1};
  text-align: left;
  font-size: 24px;
  margin-left: 5px;

  &:focus,
  &:hover {
    outline: none;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px !important;
    width: 120px;
    height: 40px;
  `}
`

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
export const NumericalInput = ({
  value,
  onUserInput,
  placeholder = '0.0',
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  placeholder?: string
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) => {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  return (
    <InputField
      {...rest}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        // replace commas with periods
        enforcer(event.target.value.replace(/,/g, '.'))
        enforcer(event.target.value.replace(/^\./g, '0.'))
      }}
      // universal input options
      inputMode="decimal"
      title="Amount"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || '0.00'}
      min={0}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  )
}
