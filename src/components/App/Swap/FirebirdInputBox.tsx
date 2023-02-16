import styled from 'styled-components'
import React from 'react'
import { Currency, Token } from '@sushiswap/core-sdk'
import { isMobile } from 'react-device-detect'

import { ArrowUpRight } from 'react-feather'
import { ExternalLink } from 'components/Link'
import { NumericalInput } from 'components/Input'
import useCurrencyLogo from 'hooks/useCurrencyLogo'
import { PrimaryButton } from 'components/Button/index'
import ImageWithFallback from 'components/ImageWithFallback'
import { ChevronDown as ChevronDownIcon } from 'components/Icons'
import { Row, RowBetween, RowCenter, RowEnd } from 'components/Row'

const Wrapper = styled(Row)`
  background: ${({ theme }) => theme.darkOrange};
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
  border: 1px solid;
  border-color: ${({ theme }) => theme.bg4};
  height: 72px;
  margin-top: 16px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 65px;
    `}
`

const NumericalWrapper = styled.div`
  width: 100%;
  font-size: 24px;
  position: relative;

  & > * {
    color: ${({ theme }) => theme.green1};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    right: 0;
  `}
`

const CurrencySymbol = styled.div<{ active?: any }>`
  font-weight: 600;
  font-size: 16px;
  margin-left: 5px;
  color: ${({ theme }) => theme.text1};
  cursor: ${({ active }) => active && 'pointer'};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-left: 6px;

  `}
`

export const RightWrapper = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border1};
  padding: 5px;
  padding-left: 10px;
  width: 100%;
  height: 100%;
  display: flex;
  /* position: relative; */
  border-radius: 0px 12px 12px 0px;
  overflow: hidden;
  background: ${({ theme }) => theme.darkOrange};
`
const OuterRightWrapper = styled.div`
  padding: 1px;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.primary8};
  border-radius: 0px 12px 12px 0px;
  overflow: hidden;
`

const OuterLogoWrapper = styled(OuterRightWrapper)`
  width: 80px;
  min-width: 60px;
  border-radius: 12px 0px 0px 12px;
  padding: 1px 0px 1px 1px;
`

export const LogoWrapper = styled(RowCenter)<{ active?: any }>`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.darkOrange};
  border-radius: 12px 0px 0px 12px;
  cursor: ${({ active }) => active && 'pointer'};
`

export const RowWrap = styled(RowEnd)`
  gap: 10px;
  font-size: 1.5rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 3px;
  `}
`

export const ChevronDown = styled(ChevronDownIcon)`
  margin-left: 7px;
  width: 16px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
      margin-left: 4px;
  `}
`

const ButtonWrapper = styled(RowEnd)`
  width: 100%;
  margin: auto 0;
  margin-right: 5px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 80px;
  `}
`

const BuyButton = styled(PrimaryButton)`
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 19px;

  text-align: center;
  text-decoration-line: underline;

  color: #111111;
  width: 123px;
  height: 48px;
  background: linear-gradient(270deg, #01aef3 -1.33%, #14e8e3 100%);
  border-radius: 12px;
`

const DataWrapper = styled.div`
  width: 100%;
`
export const getImageSize = () => {
  return isMobile ? 35 : 38
}

export default function FirebirdInputBox({
  currency,
  firebirdLink,
  value,
  onChange,
  onTokenSelect,
  disabled,
}: {
  currency: Currency
  firebirdLink: string
  value: string
  onChange(values: string): void
  onTokenSelect?: () => void
  disabled?: boolean
}) {
  const logo = useCurrencyLogo((currency as Token)?.address)

  return (
    <Wrapper>
      <OuterLogoWrapper>
        <LogoWrapper onClick={onTokenSelect ? () => onTokenSelect() : undefined} active={onTokenSelect ? true : false}>
          <ImageWithFallback
            src={logo}
            width={getImageSize()}
            height={getImageSize()}
            alt={`${currency?.symbol} Logo`}
            round
          />
          {onTokenSelect ? <ChevronDown /> : null}
        </LogoWrapper>
      </OuterLogoWrapper>

      <OuterRightWrapper>
        <RightWrapper>
          <DataWrapper>
            <RowBetween>
              <CurrencySymbol
                onClick={onTokenSelect ? () => onTokenSelect() : undefined}
                active={onTokenSelect ? true : false}
              >
                {currency?.symbol}
              </CurrencySymbol>
            </RowBetween>
            <NumericalWrapper>
              <NumericalInput
                value={value || ''}
                onUserInput={onChange}
                placeholder={disabled ? '0.0' : 'Enter an amount'}
                autoFocus
                disabled={disabled}
              />
            </NumericalWrapper>
          </DataWrapper>
          <ButtonWrapper>
            <BuyButton>
              <ExternalLink
                href={firebirdLink || 'https://app.firebird.finance/swap'}
                style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255, 128, 128, 0.5)' }}
              >
                <BuyButton>
                  Buy {currency.symbol}
                  <ArrowUpRight size={15} style={{ marginTop: '3px' }} />
                </BuyButton>
              </ExternalLink>
            </BuyButton>
          </ButtonWrapper>
        </RightWrapper>
      </OuterRightWrapper>
    </Wrapper>
  )
}
