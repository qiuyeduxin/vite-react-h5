import { getUrlParams } from '../'

describe('getUrlParams', () => {
  test('有params', () => {
    expect(getUrlParams('https://example.com/abc?uid=2')).toEqual({ uid: '2' })
  })

  test('无params', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://google.com?uid=1', search: 'uid=1' }
    })
    expect(getUrlParams()).toEqual({ uid: '1' })
  })

  test('当前网址空参数并且输入位空返回空', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://google.com', search: '' }
    })
    expect(getUrlParams()).toEqual({})
  })
  test('当前网址空参数但是有？ 并且输入位空返回空', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'https://google.com?', search: '' }
    })
    expect(getUrlParams()).toEqual({})
  })
  test('当前输入参数为空但是有？', () => {
    expect(getUrlParams('https://google.com?')).toEqual({})
  })
  test('有参数但是不完整，key有value没有', () => {
    expect(getUrlParams('https://google.com?uid=')).toEqual({ uid: '' })
  })
  test('有参数但是不完整，key没有value有', () => {
    expect(getUrlParams('https://google.com?=1')).toEqual({})
  })
})
