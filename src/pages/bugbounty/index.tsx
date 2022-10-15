import React from 'react'
import styled from 'styled-components'
// import Image from 'next/image'

// import BUG_BOUNTY from '/public/static/images/pages/bond/BDEI_nft.svg'

import Hero from 'components/Hero'
import { Container, Title } from 'components/App/StableCoin'

const MainWrap = styled.div``

const TextSpan = styled.span`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  line-height: 28px;
  padding: 5rem;
  color: ${({ theme }) => theme.text1};
  text-align: justify;
  text-justify: inter-word;

  & > * {
    &:nth-child(1) {
      font-size: 16px;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 2rem;
  `}
`

export default function Terms() {
  return (
    <Container>
      <Hero>
        {/* <Image src={TERMS_LOGO} height={'90px'} alt="Logo" /> */}
        <Title>Bug Bounty</Title>
      </Hero>
      <MainWrap>
        <TextSpan>
          {/* <p>Terms of service</p> */}
          <p>We have bug bounty ....</p>
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sequi temporibus ab facilis ad aperiam ipsum nisi
            accusamus explicabo, labore nesciunt, doloribus sint numquam expedita quo. Amet, odio aliquam. Doloremque
            officiis ex quis quia id repudiandae, molestiae distinctio minima aliquid? Quod iure quia sunt neque totam
            accusamus libero vel deserunt. Molestias, ratione. Obcaecati saepe autem eum rem, quam quod explicabo
            consequuntur cumque, nemo porro in fuga! Architecto facere labore ipsam voluptatem perferendis qui modi
            magnam possimus nisi dicta excepturi illo a id, cumque animi odit reiciendis aliquid. Vero dicta quas enim,
            nisi incidunt, animi beatae minus eos voluptas architecto, esse reprehenderit earum vitae quidem quisquam. A
            quia alias dolorem quae. Eum, excepturi? Natus quae obcaecati sint placeat ullam porro rerum asperiores
            quisquam consectetur aliquam id quos aliquid reprehenderit a accusamus ab, velit sit eos voluptate? Suscipit
            illo placeat dolore. Similique facilis optio quibusdam modi? Eveniet impedit natus minus repellat,
            asperiores autem reprehenderit aspernatur molestiae expedita corrupti deleniti, excepturi vitae corporis
            error ut fugit. Inventore quasi aliquid doloribus hic explicabo, fuga, eligendi assumenda mollitia similique
            ut debitis iure ullam, nulla asperiores numquam. Suscipit in assumenda, vitae blanditiis quae id molestiae
            ratione repellat laboriosam quis tempora atque perspiciatis error sapiente quasi, sunt mollitia aliquid
            velit magni totam. Ullam voluptatibus, commodi praesentium, impedit adipisci aspernatur quam ut obcaecati
            earum unde eius beatae vitae dolore quibusdam quasi ad eligendi, necessitatibus distinctio consequuntur quis
            voluptates enim saepe. Sint quaerat nesciunt ullam, vero quas quia nostrum consectetur mollitia inventore,
            dolorum consequuntur aliquid excepturi debitis minus fuga? Sunt cum rerum molestias suscipit quis, nulla non
            ea aut deleniti sequi corrupti veniam animi delectus odit amet consectetur, doloremque, reprehenderit nemo.
            Culpa deleniti esse doloribus. Asperiores voluptate, possimus nam magni obcaecati reiciendis aperiam officia
            similique qui omnis quibusdam culpa quasi perspiciatis? Eum commodi distinctio adipisci sequi numquam
            tempora molestias sunt?
          </p>
          <p>Contact Please email admin@deus.finance</p>
        </TextSpan>
      </MainWrap>
    </Container>
  )
}
