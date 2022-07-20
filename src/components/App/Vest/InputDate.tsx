import React, { useMemo } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import { Calendar } from 'react-feather'
import { darken, lighten } from 'polished'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Box from 'components/Box'
import { RowCenter } from 'components/Row'

import 'react-datepicker/dist/react-datepicker.css'
import { addMonth, addWeek, addYear, VestOptions } from 'utils/vest'

dayjs.extend(utc)

const Wrapper = styled(Box)`
  justify-content: flex-start;
  align-items: center;
  height: 70px;
  gap: 10px;
  padding: 0.6rem;

  &:hover {
    cursor: pointer;
  }

  & > {
    &:last-child {
      margin-left: auto;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0.5rem;
  `}

  .react-datepicker-wrapper {
    margin-left: auto;
  }

  .styled-date-picker {
    text-align: right;
    font-size: 1.5rem;
    border: none;
    align-items: flex-end;
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.text2};
    width: 200px;
  }

  // dont touch this
  .react-datepicker__navigation-icon {
    width: 20px;
  }

  // dont touch this
  .react-datepicker__navigation-icon::before {
    border-color: black !important;
  }
`

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
`

const LogoWrap = styled(RowCenter)`
  border-radius: 50%;
  border: 1px solid #afafd6;
  width: 50px;
  height: 50px;
`

const ExpirationWrapper = styled(Box)`
  display: flex;
  flex-flow: row nowrap;
  gap: 5px;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  padding: 5px;
`

const Label = styled.div`
  font-size: 0.8rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.6rem;
  `}
`

const Toggle = styled.div<{
  selected: boolean
}>`
  flex: 1;
  background: ${({ selected, theme }) => (selected ? lighten(0.1, theme.bg3) : darken(0.05, theme.bg3))};
  height: 1.5rem;
  line-height: 1.5rem;
  border-radius: 5px;
  text-align: center;
  font-size: 0.8rem;
  max-width: 85px;
  color: ${({ theme }) => theme.text3};
  &:hover {
    cursor: pointer;
    background: ${({ theme }) => lighten(0.08, theme.bg3)};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.6rem;
  `}
`

export default function InputDate({
  selectedDate,
  minimumDate,
  maximumDate,
  onDateSelect,
}: {
  selectedDate: Date
  minimumDate: Date
  maximumDate: Date
  onDateSelect(x: Date): void
}) {
  return (
    <>
      <Wrapper>
        <Column>
          <LogoWrap>
            <Calendar color="#31dbea" size={'30px'} />
          </LogoWrap>
        </Column>
        <div>
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
        </div>
      </Wrapper>
    </>
  )
}

export function SelectDatePresets({
  selectedDate,
  minimumDate,
  maximumDate,
  onDateSelect,
}: {
  selectedDate: Date
  minimumDate: Date
  maximumDate: Date
  onDateSelect: (x: Date) => void
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

  return (
    <ExpirationWrapper>
      <Label>Expiration:</Label>
      <Toggle selected={dayjs.utc(selectedDate).isSame(minimumDate, 'day')} onClick={() => onSelect(VestOptions.MIN)}>
        1 Week
      </Toggle>
      <Toggle selected={dayjs.utc(selectedDate).isSame(addMonth(), 'day')} onClick={() => onSelect(VestOptions.MONTH)}>
        1 Month
      </Toggle>
      <Toggle selected={dayjs.utc(selectedDate).isSame(addYear(), 'day')} onClick={() => onSelect(VestOptions.YEAR)}>
        1 Year
      </Toggle>
      <Toggle selected={dayjs.utc(selectedDate).isSame(maximumDate, 'day')} onClick={() => onSelect(VestOptions.MAX)}>
        4 Years
      </Toggle>
    </ExpirationWrapper>
  )
}

export function IncreaseDatePresets({
  selectedDate,
  lockEnd,
  minimumDate,
  maximumDate,
  onDateSelect,
}: {
  selectedDate: Date
  lockEnd: Date
  minimumDate: Date
  maximumDate: Date
  onDateSelect: (x: Date) => void
}) {
  const [showMinimum, showMonth, showYear, showMax] = useMemo(() => {
    return [
      dayjs.utc(minimumDate).isBefore(dayjs.utc().add(14, 'days'), 'day'),
      dayjs.utc(addMonth(lockEnd)).isBefore(maximumDate, 'day'),
      dayjs.utc(addYear(lockEnd)).isBefore(maximumDate, 'day'),
      true,
    ]
  }, [lockEnd, minimumDate, maximumDate])

  const onSelect = (checked: VestOptions) => {
    if (checked === VestOptions.MIN) {
      return onDateSelect(minimumDate)
    }
    if (checked === VestOptions.MONTH) {
      return onDateSelect(addMonth(lockEnd))
    }
    if (checked === VestOptions.YEAR) {
      return onDateSelect(addYear(lockEnd))
    }
    return onDateSelect(maximumDate)
  }

  return (
    <ExpirationWrapper>
      <Label>Add Expiration:</Label>
      {showMinimum && (
        <Toggle selected={dayjs.utc(selectedDate).isSame(minimumDate, 'day')} onClick={() => onSelect(VestOptions.MIN)}>
          {dayjs.utc(addWeek(lockEnd)).fromNow(true)}
        </Toggle>
      )}
      {showMonth && (
        <Toggle
          selected={dayjs.utc(selectedDate).isSame(addMonth(lockEnd), 'day')}
          onClick={() => onSelect(VestOptions.MONTH)}
        >
          1 Month
        </Toggle>
      )}
      {showYear && (
        <Toggle
          selected={dayjs.utc(selectedDate).isSame(addYear(lockEnd), 'day')}
          onClick={() => onSelect(VestOptions.YEAR)}
        >
          1 Year
        </Toggle>
      )}
      {showMax && (
        <Toggle selected={dayjs.utc(selectedDate).isSame(maximumDate, 'day')} onClick={() => onSelect(VestOptions.MAX)}>
          Max
        </Toggle>
      )}
    </ExpirationWrapper>
  )
}
