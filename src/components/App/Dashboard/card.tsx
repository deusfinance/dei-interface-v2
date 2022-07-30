import { useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import Link from 'next/link'

import { RowBetween } from 'components/Row'

const Wrapper = styled(RowBetween)`
  color: ${({ theme }) => theme.text1};
  background: ${({ theme }) => theme.bg2};
  overflow: hidden;
  max-width: 400px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.border2};

  & > * {
    &:first-child {
      padding: 24px;
      height: 100px;
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
  }
  &:hover {
    border-color: ${({ theme }) => theme.text3};
    background: ${({ theme }) => theme.bg3};
  }
`
const LeftWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 5px;
  font-family: 'IBM Plex Mono';
`

const Title = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.text1};
`
const SubTitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
`

export const DashboardCard = ({
  title,
  subTitle,
  href,
  MainIcon,
  HoverIcon,
}: {
  title: string | null
  subTitle: string | null
  href: string
  MainIcon: StaticImageData | string
  HoverIcon: StaticImageData | string
}): JSX.Element => {
  const [hover, setHover] = useState(false)
  return (
    <Wrapper onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link href={href} passHref>
        <a style={{ textDecoration: 'none' }}>
          <LeftWrap>
            <Title>{title}</Title>
            <SubTitle>{subTitle}</SubTitle>
          </LeftWrap>
          <Image src={hover ? HoverIcon : MainIcon} alt={'icon'} />
        </a>
      </Link>
    </Wrapper>
  )
}