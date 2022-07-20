import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(utc)
dayjs.extend(isoWeek)

/**
 * IMPORTANT NOTE:
 * Do not use any interval identifiers other than 'day' due to leap years.
 */

const THURSDAY = 4

export enum VestOptions {
  MIN,
  MONTH,
  YEAR,
  MAX,
}

export function lastThursday(targetDate?: Date): Date {
  // We should assume this date is the user's locale => set it to 23:59 and then return the UTC value.
  const modifiedUTCTarget = targetDate ?? new Date()
  modifiedUTCTarget.setHours(23, 59)
  const target = targetDate ? dayjs.utc(modifiedUTCTarget) : dayjs.utc()

  const targetWeek = target.day() >= THURSDAY ? target : target.subtract(7, 'days')
  const date = targetWeek.isoWeekday(THURSDAY).toDate()

  date.setHours(23, 59) // I don't even know if this works tbh
  return date
}

export function getMinimumDate(lockEnd?: Date): Date {
  const now = lockEnd ? dayjs.utc(lockEnd) : dayjs.utc()
  const day = now.day()

  // if we haven't yet passed Thursday
  if (day < THURSDAY) {
    // then just return this week's instance of Thursday
    return dayjs.utc().isoWeekday(THURSDAY).toDate()
  }
  // otherwise, return *next week's* instance
  return dayjs.utc().add(7, 'day').isoWeekday(THURSDAY).toDate()
}

export function getMaximumDate(): Date {
  const target = dayjs.utc().add(365 * 4, 'day')
  return lastThursday(target.toDate())
}

export function getMinimumDateByLockEnd(lockEnd: Date): Date {
  const minimum = addWeek(lockEnd)
  const maximum = getMaximumDate()
  return dayjs.utc(minimum).isBefore(maximum, 'day') ? minimum : maximum
}

export function addWeek(startDate: Date): Date {
  const date = startDate ? dayjs.utc(startDate) : dayjs.utc()
  const target = date.add(7, 'day')
  return lastThursday(target.toDate())
}

export function addMonth(startDate?: Date): Date {
  const date = startDate ? dayjs.utc(startDate) : dayjs.utc()
  const target = date.add(30, 'day')
  return lastThursday(target.toDate())
}

export function addYear(startDate?: Date): Date {
  const date = startDate ? dayjs.utc(startDate) : dayjs.utc()
  const target = date.add(365, 'day')
  return lastThursday(target.toDate())
}
