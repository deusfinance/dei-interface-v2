import { formatBalance } from './numbers'

describe('Number Utils', () => {
  it('rounds to significant digits', () => {
    expect(formatBalance('0')).toBe('0')
    expect(formatBalance('1.23')).toBe('1.23')
    expect(formatBalance('12345.678')).toBe('12345.6')
    expect(formatBalance('0.1234567', 3)).toBe('0.123')
    expect(formatBalance('99', 6)).toBe('99')
  })
  it('rounds decimals with high amount of digits to significant digits', () => {
    expect(formatBalance('0.00000051511515', 6)).toBe('0.000000515115')
    expect(formatBalance('6416465651684.00000051511515', 6)).toBe('6416465651684')
    expect(formatBalance('64164656.5168400000051511515', 6)).toBe('64164656')
  })
})
