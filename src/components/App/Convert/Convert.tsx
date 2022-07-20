import React, { useState } from 'react'
import styled from 'styled-components'

import { Card } from 'components/Card'
import { TabWrapper, TabButton } from 'components/Tab'
import ConvertToken from './ConvertToken'
import ConvertNFT from './ConvertNFT'

const Wrapper = styled(Card)`
  gap: 20px;
`

const Title = styled.div`
  font-size: 1.1rem;
  & > span {
    font-size: 0.8rem;
  }
`

export enum ConvertAction {
  TOKEN = 'FLUID Token',
  NFT = 'FLUID NFT',
}

export default function Convert() {
  const [selectedAction, setSelectedAction] = useState<ConvertAction>(ConvertAction.TOKEN)
  return (
    <Wrapper>
      <Title>
        Convert & Stake Solidly NFTs/Tokens into SOLID<span>fluid</span>
      </Title>
      <TabWrapper>
        <TabButton
          active={selectedAction === ConvertAction.TOKEN}
          onClick={() => setSelectedAction(ConvertAction.TOKEN)}
        >
          {ConvertAction.TOKEN}
        </TabButton>
        <TabButton active={selectedAction === ConvertAction.NFT} onClick={() => setSelectedAction(ConvertAction.NFT)}>
          {ConvertAction.NFT}
        </TabButton>
      </TabWrapper>
      {selectedAction === ConvertAction.TOKEN ? <ConvertToken /> : <ConvertNFT />}
    </Wrapper>
  )
}
