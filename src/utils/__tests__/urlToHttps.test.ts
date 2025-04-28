import { urlToHttps } from '../index' // 假设文件名为 urlToHttps.ts

describe('urlToHttps', () => {
  it('should return an empty string when input is empty', () => {
    expect(urlToHttps('')).toBe('')
  })

  it('should convert "http://" to "https://" when url starts with "http://"', () => {
    expect(urlToHttps('http://example.com')).toBe('https://example.com')
  })

  it('should prepend "https:" when url starts with "//"', () => {
    expect(urlToHttps('//example.com')).toBe('https://example.com')
  })

  it('should return the original url when it does not start with "http://" or "//"', () => {
    expect(urlToHttps('ftp://example.com')).toBe('ftp://example.com')
    expect(urlToHttps('https://example.com')).toBe('https://example.com')
    expect(urlToHttps('example.com')).toBe('example.com')
  })
})
