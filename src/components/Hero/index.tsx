import styled from 'styled-components'

const Hero = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  width: 100%;
  min-height: 200px;
  align-items: center;
  text-align: center;
  font-size: 60px;
  font-weight: bold;
  background: ${({ theme }) => theme.bg1};
  gap: 10px;
  padding: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-height: 100px;
    font-size: 40px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 30px;
  `}
`

export const HeroSubtext = styled.div`
  font-size: 0.8rem;
  font-weight: normal;
  text-align: center;
  width: 50%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    font-size: 0.7rem;
  `}
`

export default Hero
