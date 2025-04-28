import { getUrlQuery } from '..' // 假设文件名为 getUrlQuery.ts

describe('utils/getUrlQuery', () => {
  it('should return the value for an existing key', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://google.com?name=John&age=30&city=York' }
    })
    expect(getUrlQuery('name')).toBe('John')
    expect(getUrlQuery('age')).toBe('30')
    expect(getUrlQuery('city')).toBe('York')
  })

  it('should return an empty string for a non-existing key', () => {
    expect(getUrlQuery('country')).toBe('')
    expect(getUrlQuery('occupation')).toBe('')
  })
})
