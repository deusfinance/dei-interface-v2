import styled from 'styled-components'

const InfoWrap = styled.div<{ size?: string }>`
  flex-basis: ${({ size }) => (size ? size : '12%')};
`

export const TitleWrap = styled.span<{ active?: boolean }>`
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};
`

export default function InfoCell({ title, text, size }: { title: string; text: string; size?: string }) {
  return (
    <InfoWrap size={size}>
      <TitleWrap>{title} </TitleWrap>
      <span>{text}</span>
    </InfoWrap>
  )
}
