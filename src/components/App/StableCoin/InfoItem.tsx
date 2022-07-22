import React from 'react'
import styled from 'styled-components'

import { InfoWrapper } from './index'
import { Loader } from 'components/Icons'

const Name = styled.div`
  color: ${({ theme }) => theme.text2};
`
const ItemValue = styled.div`
  color: ${({ theme }) => theme.text1};
`

export default function InfoItem({ loading = false, name, value }: { loading?: boolean; name: string; value: string }) {
  return (
    <>
      <InfoWrapper>
        <Name>{name}</Name>
        {loading ? <Loader /> : <ItemValue> {value} </ItemValue>}
      </InfoWrapper>
    </>
  )
}
