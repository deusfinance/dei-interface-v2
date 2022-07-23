import React, { useMemo } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import { Calendar } from 'react-feather'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Box from 'components/Box'

import 'react-datepicker/dist/react-datepicker.css'
import { addMonth, addWeek, addYear, VestOptions } from 'utils/vest'

dayjs.extend(utc)

const Wrapper = styled(Box)`
  justify-content: flex-start;
  align-items: center;
  height: 33px;
  width: 140px;
  border: 2px solid ${({ theme }) => theme.text2};
  border-radius: 8px;
  gap: 10px;
  padding: 0.6rem;

  &:hover {
    cursor: pointer;
  }

  & > {
    &:last-child {
      /* margin-left: auto; */
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    // padding: 0.5rem;
  `}

  .react-datepicker-wrapper {
    /* margin-left: auto; */
    /* background: red; */
  }

  .styled-date-picker {
    /* text-align: left; */
    margin-bottom: 6px;
    margin-left: -4px;
    margin-right: -5px;
    font-size: 13px;
    border: none;
    /* align-items: flex-end; */
    background: transparent;
    outline: none;
    color: ${({ theme }) => theme.text2};
    width: 100px;
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

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  cursor: default;
`

const ExpirationWrapper = styled(Box)`
  display: flex;
  flex-flow: row nowrap;
  gap: 5px;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.bg0};
  border: 0;
  padding: 5px;
`

const Label = styled.div`
  align-self: flex-start;
  margin-top: 20px;
  font-size: 0.8rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.6rem;
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
  /* background: ${({ theme }) => theme.bg0}; */
`

const Toggle = styled.div<{ active?: any }>`
  flex: 1;
  line-height: 1.85rem;
  text-align: center;
  font-size: 0.8rem;
  width: 68px;
  max-width: 85px;
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

const DatePickerWrapper = styled.div`
  cursor: pointer;
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
    <Wrapper>
      <DatePickerWrapper>
        {/* TODO: #M add some style to this ugly datePicker */}
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
      <Column>
        <Calendar color="#FFBA93" size={'20px'} />
      </Column>
    </Wrapper>
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
    <>
      <Label>Expiration:</Label>
      <ExpirationWrapper>
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
        <InputDate
          selectedDate={selectedDate}
          minimumDate={minimumDate}
          maximumDate={minimumDate}
          onDateSelect={onDateSelect}
        />
      </ExpirationWrapper>
    </>
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
        <Toggle active={dayjs.utc(selectedDate).isSame(minimumDate, 'day')} onClick={() => onSelect(VestOptions.MIN)}>
          {dayjs.utc(addWeek(lockEnd)).fromNow(true)}
        </Toggle>
      )}
      {showMonth && (
        <Toggle
          active={dayjs.utc(selectedDate).isSame(addMonth(lockEnd), 'day')}
          onClick={() => onSelect(VestOptions.MONTH)}
        >
          1 Month
        </Toggle>
      )}
      {showYear && (
        <Toggle
          active={dayjs.utc(selectedDate).isSame(addYear(lockEnd), 'day')}
          onClick={() => onSelect(VestOptions.YEAR)}
        >
          1 Year
        </Toggle>
      )}
      {showMax && (
        <Toggle active={dayjs.utc(selectedDate).isSame(maximumDate, 'day')} onClick={() => onSelect(VestOptions.MAX)}>
          Max
        </Toggle>
      )}
    </ExpirationWrapper>
  )
}
