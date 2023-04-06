import React from 'react'
import Image from 'next/image'
import styled from 'styled-components'

import { TopTableau, TitleIMGWrap, TableauTitle } from 'components/App/StableCoin'

const Wrapper = styled(TopTableau)`
  background: ${({ theme }) => theme.bg1};
`
const Title = styled(TableauTitle)`
  font-size: 24px;
  display: flex;
  font-family: 'IBM Plex Mono';
  margin-left: 24px;
  color: ${({ theme }) => theme.text1};
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
