import React from 'react'
import Image from 'next/image'

import { TopTableau, TitleIMGWrap, TableauTitle } from '.'

export default function Tableau({ title, imgSrc }: { title: string; imgSrc?: string }) {
  return (
    <TopTableau>
      {imgSrc && (
        <TitleIMGWrap>
          <Image src={imgSrc} height={'60px'} objectFit={'cover'} objectPosition={'right'} alt="img" />
        </TitleIMGWrap>
      )}

      <TableauTitle>{title}</TableauTitle>
    </TopTableau>
  )
}
