import { formatMoney } from '../index' // 假设文件名为 formatMoney.ts

describe('utils/formatMoney', () => {
  it('should return 0 for falsy values', () => {
    expect(formatMoney(0)).toBe(0)
    expect(formatMoney('')).toBe(0)
  })

  it('should return the original input for non-numeric values', () => {
    expect(formatMoney('abc')).toBe('abc')
    expect(formatMoney(NaN)).toBe(0)
  })

  it('should format numbers greater than or equal to 100000000 as "亿"', () => {
    expect(formatMoney(100000000)).toBe('1亿')
    expect(formatMoney(123456789)).toBe('1.23亿')
  })

  it('should format numbers greater than or equal to 10000 as "万"', () => {
    expect(formatMoney(10000)).toBe('1万')
    expect(formatMoney(12345)).toBe('1.23万')
  })

  it('should return the integer part for numbers less than 10000', () => {
    expect(formatMoney(9999)).toBe(9999)
    expect(formatMoney(5000)).toBe(5000)
  })
})
