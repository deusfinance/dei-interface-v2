import styled from 'styled-components'

export const Wrapper = styled.div`
  margin-top: 16px;
  border-radius: 12px;
  width: clamp(250px, 90%, 500px);
  background: ${({ theme }) => theme.bg3};
  padding: 12px;
  height: 88px;
  position: relative;
  overflow: hidden;
`

export const BuyButtonWrapper = styled.div`
  padding: 2px;
  width: 452px;
  height: 56px;
  background: linear-gradient(90deg, #f34038 0%, #ffb396 52.08%, #f78c2a 100%);
  border-radius: 12px;
`

export const BuyButton = styled.div`
  width: 100%;
  height: 100%;

  background: linear-gradient(90deg, #f78c2a 0%, #f34038 100%),
    linear-gradient(90deg, #f34038 0%, #ffb396 52.08%, #f78c2a 100%);

  border-radius: 12px;

  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;

  text-align: center;
  outline: none;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;

  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
  `}
`
