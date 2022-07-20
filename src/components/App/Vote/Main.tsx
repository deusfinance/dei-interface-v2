import React from 'react'
import styled from 'styled-components'
import { Card } from 'components/Card'

const Wrapper = styled(Card)`
  height: 400px;
`

export default function Main() {
  return <Wrapper>The main vote content</Wrapper>
}
