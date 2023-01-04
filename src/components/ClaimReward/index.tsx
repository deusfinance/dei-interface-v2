import styled from 'styled-components'

const Reward = styled.div`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.text3};
  position: relative;
  overflow: hidden;
  height: 36px;
  background: linear-gradient(90deg, #24576d 0%, #144e4a 93.4%);
  z-index: 0;
  display: flex;
  align-items: center;
  &:before {
    content: '';
    background-image: linear-gradient(90deg, #1c94c9 0%, #3daba5 93.4%);
    position: absolute;
    width: 40%;
    height: 100%;
    z-index: -1;
  }
  & > p {
    margin-inline: 11px;
    font-size: 10px;
    font-weight: 600;
    font-family: 'Inter';
    color: ${({ theme }) => theme.text1};
  }
`
interface IProp {
  coinName: string
  hour: number
  minute: number
  second: number
}
const RewardCoin = ({ coinName, hour, minute, second }: IProp) => {
  return (
    <Reward>
      <p>
        {coinName} in {`${hour} `}:{` ${minute} `}:{` ${second}`}
      </p>
    </Reward>
  )
}

export default RewardCoin
