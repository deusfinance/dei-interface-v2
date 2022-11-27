import React from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import { Calendar } from 'react-feather'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Box from 'components/Box'

import 'react-datepicker/dist/react-datepicker.css'
import { addMonth, addYear, VestOptions } from 'utils/vest'
import { isMobile } from 'react-device-detect'

dayjs.extend(utc)

const Wrapper = styled(Box)<{ isMobileSize?: boolean }>`
  justify-content: flex-start;
  align-items: center;
  height: 33px;
  width: 152px;
  border: 2px solid ${({ theme }) => theme.text2};
  border-radius: 8px;
  gap: 10px;
  padding: 0.6rem;

  &:hover {
    cursor: pointer;
  }

  ${({ isMobileSize, theme }) =>
    isMobileSize &&
    `
    border: 1px solid ${theme.text2};
    margin-top: 6px;
    margin-left: auto;
    width: 190px;
  `}

  .react-datepicker-wrapper {
    /* margin-left: auto; */
    /* background: red; */
  }

  .styled-date-picker {
    margin-bottom: 6px;
    margin-left: -4px;
    margin-right: -5px;
    font-size: 13px;
    border: none;
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.text2};
    width: 113px;
    /* align-items: flex-end; */
    /* text-align: left; */
  }

  // don't touch this
  .react-datepicker__navigation-icon {
    width: 20px;
  }

  // don't touch this
  .react-datepicker__navigation-icon::before {
    border-color: black !important;
  }
`

const TimePeriodWrapper = styled.div<{ isMobileSize?: boolean }>`
  width: 100%;

  ${({ isMobileSize }) =>
    isMobileSize &&
    `
    display: flex;
    justify-content: space-between;
    width: 100%;
  `}
`

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  cursor: default;
`

const ExpirationWrapper = styled(Box)<{ isMobileSize?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  gap: 5px;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bg0};
  border: 0;
  padding: 5px;
  margin-left: ${({ isMobileSize }) => (isMobileSize ? '0' : '-12px')};

  & > * {
    margin-left: auto;
  }
`

const Label = styled.div<{ isMobileSize?: boolean }>`
  align-self: flex-start;
  margin-top: 18px;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  ${({ isMobileSize }) =>
    isMobileSize &&
    `
    font-size: 0.75rem;
  `}
`

const TopBorderWrap = styled.div<{ active?: any }>`
  background: ${({ theme, active }) => (active ? theme.primary4 : theme.text2)};
  padding: 1px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg0};

  &:hover {
    border: 1px solid ${({ theme, active }) => (active ? theme.bg0 : theme.warning)};
  }
`

const TopBorder = styled.div`
  border-radius: 6px;
`

const Toggle = styled.div<{ active?: any }>`
  font-family: 'Inter';
  flex: 1;
  line-height: 1.85rem;
  text-align: center;
  font-size: 0.8rem;
  min-width: 70px;
  color: ${({ theme }) => theme.text1};
  background: ${({ theme, active }) => (active ? theme.bg0 : theme.bg3)};
  border-radius: 6px;

  &:hover {
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.6rem;
  `}
`

const DatePickerWrapper = styled.div<{ isMobileSize?: boolean }>`
  cursor: pointer;

  ${({ isMobileSize }) =>
    isMobileSize &&
    `
    margin-top: 2px;
  `}
`

const MaxButton = styled.span`
  color: white;
  cursor: pointer;
  z-index: 2;
  margin-top: -4px;
`

export default function InputDate({
  selectedDate,
  minimumDate,
  maximumDate,
  onDateSelect,
  isMobileSize,
}: {
  selectedDate: Date
  minimumDate: Date
  maximumDate: Date
  onDateSelect(x: Date): void
  isMobileSize?: boolean
}) {
  const MobileSize = isMobileSize || isMobile

  return (
    <Wrapper isMobileSize={MobileSize}>
      {MobileSize && (
        <Column>
          <Calendar color="#FFBA93" size={'20px'} />
        </Column>
      )}
      <DatePickerWrapper>
        <DatePicker
          selected={selectedDate}
          className="styled-date-picker"
          dateFormat="MMMM d, yyyy"
          onChange={(value: Date) => {
            /**
             * This date is the user's locale => set it to 23:59 and then return the UTC value.
             * If the UTC is > 23:59 the 'lastThursday' function will correct it
             * If the UTC is < 23:59 we're already on the right day.
             */
            const correctedDate = value
            correctedDate.setHours(23, 59)

            // check if the 7-day minimum applies
            if (correctedDate.getTime() < minimumDate.getTime()) {
              return onDateSelect(minimumDate)
            }
            return onDateSelect(correctedDate)
          }}
          minDate={minimumDate}
          maxDate={maximumDate}
          showMonthDropdown
          showWeekNumbers
        />
      </DatePickerWrapper>
      {MobileSize ? (
        <MaxButton onClick={() => onDateSelect(maximumDate)}>Max</MaxButton>
      ) : (
        <Column>
          <Calendar color="#FFBA93" size={'20px'} />
        </Column>
      )}
    </Wrapper>
  )
}

export function SelectDatePresets({
  selectedDate,
  minimumDate,
  maximumDate,
  onDateSelect,
  isMobileSize,
}: {
  selectedDate: Date
  minimumDate: Date
  maximumDate: Date
  onDateSelect: (x: Date) => void
  isMobileSize?: boolean
}) {
  const onSelect = (checked: VestOptions) => {
    if (checked === VestOptions.MIN) {
      return onDateSelect(minimumDate)
    }
    if (checked === VestOptions.MONTH) {
      return onDateSelect(addMonth())
    }
    if (checked === VestOptions.YEAR) {
      return onDateSelect(addYear())
    }
    if (checked === VestOptions.MAX) {
      return onDateSelect(maximumDate)
    }
  }

  const MobileSize = isMobileSize || isMobile

  return (
    <TimePeriodWrapper isMobileSize={MobileSize}>
      <Label isMobileSize={MobileSize}>Expiration:</Label>
      <ExpirationWrapper isMobileSize={MobileSize}>
        {!MobileSize && (
          <TopBorderWrap active={dayjs.utc(selectedDate).isSame(minimumDate, 'day')}>
            <TopBorder>
              <Toggle
                active={dayjs.utc(selectedDate).isSame(minimumDate, 'day')}
                onClick={() => onSelect(VestOptions.MIN)}
              >
                1 Week
              </Toggle>
            </TopBorder>
          </TopBorderWrap>
        )}

        {!MobileSize && (
          <TopBorderWrap active={dayjs.utc(selectedDate).isSame(addMonth(), 'day')}>
            <TopBorder>
              <Toggle
                active={dayjs.utc(selectedDate).isSame(addMonth(), 'day')}
                onClick={() => onSelect(VestOptions.MONTH)}
              >
                1 Month
              </Toggle>
            </TopBorder>
          </TopBorderWrap>
        )}

        {!MobileSize && (
          <TopBorderWrap active={dayjs.utc(selectedDate).isSame(addYear(), 'day')}>
            <TopBorder>
              <Toggle
                active={dayjs.utc(selectedDate).isSame(addYear(), 'day')}
                onClick={() => onSelect(VestOptions.YEAR)}
              >
                1 Year
              </Toggle>
            </TopBorder>
          </TopBorderWrap>
        )}

        {!MobileSize && (
          <TopBorderWrap active={dayjs.utc(selectedDate).isSame(maximumDate, 'day')}>
            <TopBorder>
              <Toggle
                active={dayjs.utc(selectedDate).isSame(maximumDate, 'day')}
                onClick={() => onSelect(VestOptions.MAX)}
              >
                4 Years
              </Toggle>
            </TopBorder>
          </TopBorderWrap>
        )}
        <InputDate
          selectedDate={selectedDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onDateSelect={onDateSelect}
          isMobileSize={MobileSize}
        />
      </ExpirationWrapper>
    </TimePeriodWrapper>
  )
}

// export function IncreaseDatePresets({
//   selectedDate,
//   lockEnd,
//   minimumDate,
//   maximumDate,
//   onDateSelect,
// }: {
//   selectedDate: Date
//   lockEnd: Date
//   minimumDate: Date
//   maximumDate: Date
//   onDateSelect: (x: Date) => void
// }) {
//   const [showMinimum, showMonth, showYear, showMax] = useMemo(() => {
//     return [
//       dayjs.utc(minimumDate).isBefore(dayjs.utc().add(14, 'days'), 'day'),
//       dayjs.utc(addMonth(lockEnd)).isBefore(maximumDate, 'day'),
//       dayjs.utc(addYear(lockEnd)).isBefore(maximumDate, 'day'),
//       true,
//     ]
//   }, [lockEnd, minimumDate, maximumDate])

//   const onSelect = (checked: VestOptions) => {
//     if (checked === VestOptions.MIN) {
//       return onDateSelect(minimumDate)
//     }
//     if (checked === VestOptions.MONTH) {
//       return onDateSelect(addMonth(lockEnd))
//     }
//     if (checked === VestOptions.YEAR) {
//       return onDateSelect(addYear(lockEnd))
//     }
//     return onDateSelect(maximumDate)
//   }

//   return (
//     <ExpirationWrapper>
//       <Label isMobileSize={isMobile}>Add Expiration:</Label>
//       {showMinimum && (
//         <Toggle active={dayjs.utc(selectedDate).isSame(minimumDate, 'day')} onClick={() => onSelect(VestOptions.MIN)}>
//           {dayjs.utc(addWeek(lockEnd)).fromNow(true)}
//         </Toggle>
//       )}
//       {showMonth && (
//         <Toggle
//           active={dayjs.utc(selectedDate).isSame(addMonth(lockEnd), 'day')}
//           onClick={() => onSelect(VestOptions.MONTH)}
//         >
//           1 Month
//         </Toggle>
//       )}
//       {showYear && (
//         <Toggle
//           active={dayjs.utc(selectedDate).isSame(addYear(lockEnd), 'day')}
//           onClick={() => onSelect(VestOptions.YEAR)}
//         >
//           1 Year
//         </Toggle>
//       )}
//       {showMax && (
//         <Toggle active={dayjs.utc(selectedDate).isSame(maximumDate, 'day')} onClick={() => onSelect(VestOptions.MAX)}>
//           Max
//         </Toggle>
//       )}
//     </ExpirationWrapper>
//   )
// }
