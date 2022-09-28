import Image from 'next/image'
import styled from 'styled-components'
import MEN_AT_WORK from '/public/static/images/pages/dashboard/menAtWork.svg'

const Wrapper = styled.div`
  /* background: ${({ theme }) => theme.bg0}; */
  /* border-radius: 12px; */
  /* width: 100%; */
  /* height: 457px; */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  /* padding: 38px 36px; */
  /* padding-top: 230px; */
  text-align: center;
  justify-content: center;
  vertical-align: baseline;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`

export default function Chart() {
  return (
    <Wrapper>
      <Image src={MEN_AT_WORK} alt="MEN_AT_WORK" />
    </Wrapper>
  )
}
