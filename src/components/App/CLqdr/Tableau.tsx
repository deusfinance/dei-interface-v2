import React from 'react'
import Image from 'next/image'
import styled from 'styled-components'

import { TopTableau, TitleIMGWrap, TableauTitle } from 'components/App/StableCoin'

const Wrapper = styled(TopTableau)`
  /* background: linear-gradient(339.11deg, #1984ff 9.31%, #4dd9f6 96.03%); */
  background: transparent;
`
const Title = styled(TableauTitle)`
  color: ${({ theme }) => theme.cLqdrColor};
`

export default function Tableau({ title, imgSrc }: { title: string; imgSrc: string }) {
  return (
    <Wrapper>
      {imgSrc && (
        <TitleIMGWrap>
          <Image src={imgSrc} height={'60px'} objectFit={'cover'} objectPosition={'right'} alt="img" />
        </TitleIMGWrap>
      )}

      <Title>{title}</Title>
    </Wrapper>
  )
}
